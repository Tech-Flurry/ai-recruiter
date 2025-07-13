# ScoreFunction

An Azure Function (HTTP Trigger) that detects AI-generated content in text using GPT-2 (HuggingFace Transformers). This function is self-contained and does not depend on any other files in the project.

## Usage
- Deploy the function to Azure or run locally with Azure Functions Core Tools.
- Send a POST request to the function endpoint with a JSON body:

```
{
  "text": "your text here"
}
```

## Response
Returns a JSON object with the perplexity score and a label:
```
{
  "perplexity": 55.2,
  "label": "AI-generated"
}
```

## Requirements
- Python 3.8–3.12 recommended
- Azure Functions Python library
- torch
- transformers

## Local Development
1. Install Azure Functions Core Tools
2. Install dependencies:
   - `pip install azure-functions torch transformers`
3. Start the function locally:
   - `func start`
