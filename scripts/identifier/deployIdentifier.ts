import { toNano } from '@ton/core';
import { Identifier } from '../../wrappers/Identifier';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const identifier = provider.open(
        Identifier.createFromConfig({ managerAddress: provider.sender().address! }, await compile('Identifier')),
    );

    await identifier.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(identifier.address);
}
