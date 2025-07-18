import * as lambda from 'aws-cdk-lib/aws-lambda';
import { KubectlV29Layer } from '@aws-cdk/lambda-layer-kubectl-v29';
import { KubectlV30Layer } from '@aws-cdk/lambda-layer-kubectl-v30';
import { KubectlV31Layer } from '@aws-cdk/lambda-layer-kubectl-v31';
import { KubectlV32Layer } from '@aws-cdk/lambda-layer-kubectl-v32';
import { KubectlV33Layer } from '@aws-cdk/lambda-layer-kubectl-v33';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';

// This object maps Kubernetes version strings to their corresponding
// KubectlLayerVersion constructor functions. This allows us to dynamically
// create the appropriate KubectlLayerVersion instance based on the
// Kubernetes version.
const versionMap: { [key: string]: new (scope: Construct, id: string) => lambda.ILayerVersion } = {
  '1.29': KubectlV29Layer,
  '1.30': KubectlV30Layer,
  '1.31': KubectlV31Layer,
  '1.32': KubectlV32Layer,
  '1.33': KubectlV33Layer,
};

export function getClusterVersionConfig(scope: Construct, version?: eks.KubernetesVersion) {
  const _version = version ?? eks.KubernetesVersion.V1_32;
  return {
    version: _version,
    // Crazy type-casting is required because KubectlLayer peer depends on
    // types from aws-cdk-lib, but we run integration tests in the @aws-cdk/
    // v1-style directory, not in the aws-cdk-lib v2-style directory.
    // kubectlLayer: new KubectlV24Layer(scope, 'KubectlLayer') as unknown as lambda.ILayerVersion,
    kubectlLayer: new versionMap[_version.version](scope, 'KubectlLayer') as unknown as lambda.ILayerVersion,
  };
}
