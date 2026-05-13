import { build, checkUpdateNeeded, clean, clone, parsePkgList } from './util.ts';

const pkglist = parsePkgList('pkglist');

async function updateAur() {
  for (const pkg of pkglist) {
    await clone(pkg);

    if (checkUpdateNeeded(pkg)) {
      const buildStatus = await build(`aur/${pkg}`);

      if (buildStatus) {
        console.log(`${pkg} has succesfully finished building.`);
      } else {
        console.log(`${pkg} has failed to build.`);
      }

      Deno.copyFileSync(`aur/${pkg}/PKGBUILD`, `cache/${pkg}.pkgbuild`);
    } else {
      console.log(`Skipping ${pkg}, no update needed.`);
    }
  }
  
  clean();
}

await updateAur();