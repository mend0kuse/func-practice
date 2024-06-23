import { toNano } from '@ton/core';
import { Serializer } from '../wrappers/Serializer';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const serializer = provider.open(Serializer.createFromConfig({}, await compile('Serializer')));

    await serializer.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(serializer.address);

    // run methods on `serializer`
}
