import { build, checkUpdateNeeded, clean, cloneAur, cloneCustom, logSummary, parsePkgList, rebuildRepo, sendNotification } from './util.ts';

async function updateAur() {
  const pkglist = parsePkgList('aurlist');

  const success: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];

  for (const pkg of pkglist) {
    await cloneAur(pkg);

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
  await sendNotification('Nightly Builder AUR', 'Nightly Builder has finished.');
}

async function updateCustom() {
  const pkglist = parsePkgList('pkglist');

  const success: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];

  for (const pkg of pkglist) {
    await cloneCustom(pkg, 'https://git.iusearchbtw.nl/packages');

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
  await sendNotification('Nightly Builder Custom', 'Nightly Builder has finished.');
}

await updateAur();
await updateCustom();
await rebuildRepo();