import os
from openai import OpenAI

import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

from werkzeug.exceptions import abort

from habit_tracker.auth import login_required
from habit_tracker.db import get_db

from dotenv import load_dotenv
import os

load_dotenv()

bp = Blueprint('chat', __name__, url_prefix='/chat')


# client = OpenAI()

# response = client.responses.create(
#     model= "gpt-5-mini",
#     input= "Hi!",
# )

# print(response.output_text)



