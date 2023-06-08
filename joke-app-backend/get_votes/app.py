import json
import boto3
from os import environ as env
from dynamodb_json import json_util as json_db

db_client = boto3.client('dynamodb')
DYNAMODB_TABLE_VOTES = env['DYNAMODB_TABLE_VOTES']


def lambda_handler(event, context):
    body = json.loads(event['body'])

    response = db_client.query(
        TableName=DYNAMODB_TABLE_VOTES,
        KeyConditionExpression='userId = :userId',
        ExpressionAttributeValues={
            ':userId': {'S': body['userId']}
        }
    )

    if 'Items' in response:
        votes_list = json_db.loads(response['Items'])
    else:
        votes_list = []

    votes = {}
    for vote in votes_list:
        votes[vote['jokeId']] = vote['type']

    return {
        "statusCode": 200,
        "headers": {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        "body": json.dumps({'votes': votes}),
    }
