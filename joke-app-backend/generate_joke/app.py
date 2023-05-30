import json
import boto3
import openai
import uuid
from os import environ as env

db_client = boto3.client('dynamodb')
DYNAMODB_TABLE_JOKES = env['DYNAMODB_TABLE_JOKES']

def getOpenAPIKey():
    secret_name = "OpenAIKey"
    region_name = "us-west-2"
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    get_secret_value_response = client.get_secret_value(
        SecretId=secret_name
    )

    return json.loads(get_secret_value_response['SecretString'])['Secret Key']

def lambda_handler(event, context):
    topic = json.loads(event['body'])['topic']

    openai.api_key = getOpenAPIKey()
    model = 'gpt-3.5-turbo'
    response = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "user", "content": "Write a joke about " + topic + ". Respond with only the joke itself."},
        ],
        max_tokens=1000
    )
    joke = response['choices'][0]['message']['content'] 
    id = str(uuid.uuid4())
    db_client.put_item (
        TableName=DYNAMODB_TABLE_JOKES,
        Item={
            'jokeId': {'S': id},
            'joke': {'S': joke},
            'votes': {'N': '0'},
        }
    )
    
    return {
        "statusCode": 200,
        "headers": {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        "body": json.dumps({'joke': joke}),
    }
