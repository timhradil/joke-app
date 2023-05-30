import json
import boto3
from os import environ as env

db_client = boto3.client('dynamodb')
DYNAMODB_TABLE_JOKES = env['DYNAMODB_TABLE_JOKES']
DYNAMODB_TABLE_VOTES = env['DYNAMODB_TABLE_VOTES']

def lambda_handler(event, context):
    body = json.loads(event['body'])

    response = db_client.get_item(
        TableName=DYNAMODB_TABLE_JOKES,
        Key={
            'jokeId': {'S': body['jokeId']}
        }
    )
    votes = int(response['Item']['votes']['N'])

    response = db_client.get_item(
        TableName=DYNAMODB_TABLE_VOTES,
        Key={
            'userId': {'S': body['userId']},
            'jokeId': {'S': body['jokeId']}
        }
    )

    if 'Item' in response:
        old_type = response['Item']['type']['S']
        if old_type == body['type']:
            votes = votes
        elif old_type == 'upvote':
            votes = votes - 2
        else:
            votes = votes + 2
    else:
        if body['type'] == 'upvote':
            votes = votes + 1
        else:
            votes = votes - 1
    
    response = db_client.update_item(
        TableName=DYNAMODB_TABLE_JOKES,
        Key={
            'jokeId': {'S': body['jokeId']}
        },
        UpdateExpression='SET votes = :votes',
        ExpressionAttributeValues={
            ':votes': {'N': str(votes)}
        }
    )

    response = db_client.put_item(
        TableName=DYNAMODB_TABLE_VOTES,
        Item= {
            'userId': {'S': body['userId']},
            'jokeId': {'S': body['jokeId']},
            'type': {'S': body['type']}
        }
    )

    return {
        "statusCode": 200,
        "headers": {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        "body": json.dumps({}),
    }
