import { git } from '@roka/git';
import { green, red, yellow } from '@std/fmt/colors';
import { existsSync } from 'node:fs';
import { config } from '../config.ts';

export function parsePkgList(file: string): string[] {
  return Deno.readTextFileSync(file).trim().split('\n');
}

export async function clone(pkg: string) {
  await git().clone(`https://aur.archlinux.org/${pkg}.git`, {
    directory: `aur/${pkg}`
  });
}

export async function build(path: string): Promise<boolean> {
  const cwd = Deno.cwd();

  Deno.chdir(path);

  const buildCommand = new Deno.Command(`/usr/bin/makepkg`, {
    args: [
      '-s', '-f', '--clean', '--config', `${cwd}/makepkg.conf`
    ]
  });

  const child = buildCommand.spawn();

  const status = await child.status;

  Deno.chdir(cwd);

  return status.success;
}

export function clean() {
  for (const dir of Deno.readDirSync('aur')) {
    Deno.removeSync(`aur/${dir.name}`, { recursive: true });
  }
}

export function checkUpdateNeeded(pkg: string): boolean {
  if (!existsSync(`cache/${pkg}.pkgbuild`) || pkg.endsWith('-git')) return true;

  const cachedPkgbuild = Deno.readTextFileSync(`cache/${pkg}.pkgbuild`);
  const newPkgbuild = Deno.readTextFileSync(`aur/${pkg}/PKGBUILD`);

  return cachedPkgbuild !== newPkgbuild;
}

export function logSummary(success: string[], failed: string[], skipped: string[]) {
  if (success.length !== 0) {
    console.log(green('\n\nSuccess'));
    for (const pkg of success) {
      console.log(`  - ${pkg}`);
    }
  }
  
  if (failed.length !== 0) {
    console.log(red('\nFailed:'));
    for (const pkg of failed) {
      console.log(`  - ${pkg}`);
    }
  }

  if (skipped.length !== 0) {
    console.log(yellow('\nSkipped:'));
    
    for (const pkg of skipped) {
      console.log(`  - ${pkg}`);
    }
  }
}

export async function sendNotification(title: string, message: string, priority: number = 5) {
  await fetch(`${config.gotify_url}/message?token=${config.gotify_token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title,
      message: message,
      priority: priority
    })
  });
}