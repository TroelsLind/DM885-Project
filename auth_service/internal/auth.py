""" JWT Token Generation using RSA256 """

import os
import jwt
import time
import base64

from fastapi import APIRouter
from decouple import config

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization

router: APIRouter = APIRouter()


PRIVATE_KEY_FILE = os.environ.get("AUTH_PRIVATE_KEY")
PUBLIC_KEY_FILE = config("PUBLIC_KEY_FILE")
SESSION_TIME = config("SESSION_TIME", cast=int, default=3600)


# Base64 decode the key
PRIVATE_KEY_FILE = base64.b64decode(PRIVATE_KEY_FILE)

PRIVATE_KEY = serialization.load_pem_private_key(
    PRIVATE_KEY_FILE, password=None, backend=default_backend()
)

with open(PUBLIC_KEY_FILE, "rb") as f:
    PUBLIC_KEY = serialization.load_pem_public_key(f.read(), backend=default_backend())


def sign_jwt(user_id: str, payload: dict = None, uuid=None) -> str:
    """Create and sign a JWT token using the secret private key

    Args:
        user_id (str): The user id to sign the token with

    Payload:
        user_id: str
        expiration: int (unix timestamp)

    Returns:
        str: The signed JWT token
    """

    if uuid is None:
        raise ValueError("UUID is required")

    new_payload = {
        "user_id": user_id,
        "expiration": str(time.time() + SESSION_TIME),
        "permissions": payload or {},
        "uuid": str(uuid),
    }
    token = jwt.encode(new_payload, PRIVATE_KEY, algorithm="RS256")

    return token


def decode_jwt(token: str) -> str:
    """Decode a JWT token using the public key

    Args:
        token (str): The token to decode

    Returns:
        str: The decoded token
    """

    return jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])


def validate_token(token: str) -> bool:
    """Validate a JWT token

    Args:
        token (str): The token to validate

    Returns:
        bool: True if the token is valid, False otherwise
    """

    try:
        payload = decode_jwt(token)

        # Check if the token has expired
        if time.time() > float(payload["expiration"]):
            return False

    # @TODO : Multiple exceptions for later logging purposes
    except jwt.exceptions.InvalidSignatureError:
        return False
    except KeyError:
        return False
    except:
        return False

    return True
