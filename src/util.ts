import { git } from '@roka/git';
import { existsSync } from 'node:fs';

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
      '-s', '--clean', '--config', `${cwd}/makepkg.conf`
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