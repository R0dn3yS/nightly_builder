import { build, checkUpdateNeeded, clean, clone, logSummary, parsePkgList, sendNotification } from './util.ts';

const pkglist = parsePkgList('pkglist');

async function updateAur() {
  const success: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];

  for (const pkg of pkglist) {
    await clone(pkg);

    if (checkUpdateNeeded(pkg)) {
      const buildStatus = await build(`aur/${pkg}`);

      if (buildStatus) {
        console.log(`${pkg} has successfully finished building.`);
        Deno.copyFileSync(`aur/${pkg}/PKGBUILD`, `cache/${pkg}.pkgbuild`);
        await sendNotification('Nightly Builder', `${pkg} has been built successfully.`)
        success.push(pkg);
      } else {
        console.log(`${pkg} has failed to build.`);
        await sendNotification('Nightly Builder', `${pkg} has failed building.`)
        failed.push(pkg);
      }

    } else {
      console.log(`Skipping ${pkg}, no update needed.`);
      skipped.push(pkg);
    }
  }

  clean();
  logSummary(success, failed, skipped);
  await sendNotification('Nightly Builder', 'Nightly Builder has finished.');
}

await updateAur();