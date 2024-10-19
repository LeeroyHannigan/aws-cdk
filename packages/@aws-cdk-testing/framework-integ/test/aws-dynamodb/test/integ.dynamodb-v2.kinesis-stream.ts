import { IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { ApproximateCreationDateTimePrecision, AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Stream } from 'aws-cdk-lib/aws-kinesis';
import { Construct } from 'constructs';

class TestStack extends Stack {
  public constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const stream = new Stream(this, 'Stream');
    const stream2 = {
      stream: new Stream(this, 'KinesisStream1'),
      approximateCreationDateTimePrecision: ApproximateCreationDateTimePrecision.MILLISECOND,
    };
    // Just Stream()
    new TableV2(this, 'Table', {
      partitionKey: { name: 'hashKey', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      kinesisStream: stream,
    });
    // Stream with additional approximateCreationDateTimePrecision
    new TableV2(this, 'Table2', {
      partitionKey: { name: 'hashKey', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      kinesisStream: stream2,
      replicas: [{
        region: 'us-east-1',
      }],
    });
    // No Stream
    new TableV2(this, 'Table3', {
      partitionKey: { name: 'hashKey', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}

const app = new App();
new IntegTest(app, 'global-table-kinesis-stream', {
  testCases: [new TestStack(app, 'global-table-kinesis-stream-test', { env: { region: 'eu-west-1' } })],
  regions: ['eu-west-1'],
  stackUpdateWorkflow: false,
});
