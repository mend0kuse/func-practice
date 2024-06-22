import { toNano } from '@ton/core';
import { MergeDictionaries } from '../wrappers/MergeDictionaries';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const mergeDictionaries = provider.open(MergeDictionaries.createFromConfig({}, await compile('MergeDictionaries')));

    await mergeDictionaries.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(mergeDictionaries.address);

    // run methods on `mergeDictionaries`
}
