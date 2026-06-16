import { build, buildAur, buildCustom, checkUpdateNeeded, clean, cloneAur, cloneCustom, logSummary, parsePkgList, rebuildRepo, sendNotification } from './util.ts';

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

function sendHelpMessage() {
  const helpString = `nightly builder 0.1.0

Usage: deno run update [options]

Options:
  --aur <package>     Build a package from the aur
  --clean             Clean the package cache and exit
  --custom <package>  Build a package from the custom repo
  --help              Show this help message and exit`;

  return console.log(helpString);
}

if (Deno.args.length === 0) {
  await updateAur();
  await updateCustom();
  await rebuildRepo();
} else {
  for (let i = 0; i < Deno.args.length; i++) {
    const arg = Deno.args[i];

    switch (Deno.args[i]) {
      case '--help': {
        sendHelpMessage();
        Deno.exit(0);
      }

      
      // deno-lint-ignore no-fallthrough
      case '--aur': {
        const pkg = Deno.args[i + 1];
        
        if (!pkg) {
          console.error('No package specified');
          Deno.exit(1);
        }

        await buildAur(pkg);
        await rebuildRepo();
        clean();
        Deno.exit(0);
      }

      case '--custom': {
        const pkg = Deno.args[i + 1];
        
        if (!pkg) {
          console.error('No package specified');
          Deno.exit(1);
        }

        await buildCustom(pkg);
        await rebuildRepo();
        clean();
        Deno.exit(0);
      }

      // deno-lint-ignore no-fallthrough
      case '--clean': {
        clean();
        Deno.exit(0);
      }

      default: console.error(`Invalid option: ${arg}`);
    }
  }
}