import json
import boto3
from os import environ as env
from dynamodb_json import json_util as json_db

db_client = boto3.client('dynamodb')
DYNAMODB_TABLE_JOKES = env['DYNAMODB_TABLE_JOKES']

def lambda_handler(event, context):

    response = db_client.scan(
        TableName=DYNAMODB_TABLE_JOKES,
        Limit=100
    )

    if 'Items' in response:
        jokes = json_db.loads(response['Items'])
    else:
        jokes = []

    return {
        "statusCode": 200,
        "headers": {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        "body": json.dumps({'jokes': jokes}),
    }
