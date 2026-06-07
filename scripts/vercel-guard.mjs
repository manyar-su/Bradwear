import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const cwd = process.cwd();
const projectJsonPath = path.join(cwd, '.vercel', 'project.json');

function fail(message) {
  console.error(`\n[vercel-guard] ${message}`);
  process.exit(1);
}

function runVercel(args, options = {}) {
  const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'vercel';
  const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'vercel', ...args] : args;
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
    ...options,
  });

  if (result.error) {
    fail(result.error.message);
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }
}

function getLinkedProject() {
  if (!existsSync(projectJsonPath)) {
    return null;
  }

  return JSON.parse(readFileSync(projectJsonPath, 'utf8'));
}

function parseArgs(argv) {
  const [command, maybeProject, ...rest] = argv;
  const parsed = {
    command,
    project: maybeProject && !maybeProject.startsWith('--') ? maybeProject : '',
    scope: '',
    prod: false,
  };

  const flags = parsed.project ? rest : [maybeProject, ...rest].filter(Boolean);

  for (let i = 0; i < flags.length; i += 1) {
    const current = flags[i];
    if (current === '--scope') {
      parsed.scope = flags[i + 1] || '';
      i += 1;
      continue;
    }
    if (current === '--prod') {
      parsed.prod = true;
    }
  }

  return parsed;
}

function requireProject(project) {
  if (!project) {
    fail('Project name wajib diisi. Contoh: npm run vercel:deploy -- bradwearflow --scope manyar-sus-projects');
  }
}

function requireScope(scope) {
  if (!scope) {
    fail('Scope wajib diisi. Contoh: --scope manyar-sus-projects');
  }
}

function ensureLinkedProject(expectedProject) {
  const linked = getLinkedProject();
  if (!linked) {
    fail(`Folder ini belum linked ke project "${expectedProject}". Jalankan link dulu.`);
  }

  if (linked.projectName !== expectedProject) {
    fail(`Project linked saat ini "${linked.projectName}", bukan "${expectedProject}". Jalankan switch dulu.`);
  }

  return linked;
}

function printStatus(expectedProject = '') {
  const linked = getLinkedProject();
  if (!linked) {
    console.log('[vercel-guard] Folder ini belum linked ke project Vercel mana pun.');
    return;
  }

  console.log(`[vercel-guard] Linked project: ${linked.projectName}`);
  console.log(`[vercel-guard] Project ID: ${linked.projectId}`);
  console.log(`[vercel-guard] Org ID: ${linked.orgId}`);

  if (expectedProject && linked.projectName !== expectedProject) {
    fail(`Expected "${expectedProject}" tetapi folder ini linked ke "${linked.projectName}".`);
  }
}

function linkProject(project, scope) {
  requireProject(project);
  requireScope(scope);

  console.log(`[vercel-guard] Linking folder ini ke project "${project}" dalam scope "${scope}"...`);
  runVercel(['link', '--yes', '--project', project, '--scope', scope]);
  ensureLinkedProject(project);
  console.log(`[vercel-guard] Link aman: sekarang mengarah ke "${project}".`);
}

function deployProject(project, scope, prod) {
  requireProject(project);
  requireScope(scope);

  linkProject(project, scope);
  ensureLinkedProject(project);

  const deployArgs = ['deploy', '--yes', '--scope', scope];
  if (prod) {
    deployArgs.push('--prod');
  }

  console.log(`[vercel-guard] Deploy ${prod ? 'production' : 'preview'} ke "${project}"...`);
  runVercel(deployArgs);
}

const args = parseArgs(process.argv.slice(2));

switch (args.command) {
  case 'status':
    printStatus(args.project);
    break;
  case 'switch':
    linkProject(args.project, args.scope);
    break;
  case 'deploy':
    deployProject(args.project, args.scope, args.prod);
    break;
  default:
    fail('Command tidak dikenal. Gunakan: status, switch, atau deploy.');
}
