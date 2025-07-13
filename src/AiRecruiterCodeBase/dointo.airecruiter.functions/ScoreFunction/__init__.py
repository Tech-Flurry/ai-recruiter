import azure.functions as func
import json
import torch
import logging
from transformers import GPT2LMHeadModel, GPT2TokenizerFast

def calculate_perplexity(text, model, tokenizer, stride=512):
    logging.info("Calculating perplexity for input text of length %d", len(text))
    encodings = tokenizer(text, return_tensors="pt")
    seq_len = encodings.input_ids.size(1)
    max_length = model.config.n_positions
    nlls = []
    prev_end_loc = 0
    for begin_loc in range(0, seq_len, stride):
        end_loc = min(begin_loc + max_length, seq_len)
        trg_len = end_loc - prev_end_loc
        input_ids = encodings.input_ids[:, begin_loc:end_loc]
        target_ids = input_ids.clone()
        target_ids[:, :-trg_len] = -100
        with torch.no_grad():
            outputs = model(input_ids, labels=target_ids)
            neg_log_likelihood = outputs.loss * trg_len
        nlls.append(neg_log_likelihood)
        prev_end_loc = end_loc
        if end_loc == seq_len:
            break
    ppl = torch.exp(torch.stack(nlls).sum() / end_loc)
    logging.info("Perplexity calculated: %f", ppl)
    return float(ppl)

def ai_label(perplexity):
    logging.info("Assigning label for perplexity: %f", perplexity)
    if perplexity < 60:
        return "AI-generated"
    elif perplexity < 80:
        return "Possibly AI-generated"
    else:
        return "Human-written"

model = None
tokenizer = None

def main(req: func.HttpRequest) -> func.HttpResponse:
    global model, tokenizer
    logging.info("Received request for AI score.")
    if model is None or tokenizer is None:
        logging.info("Loading GPT2 model and tokenizer.")
        model = GPT2LMHeadModel.from_pretrained("gpt2")
        tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")

    try:
        req_body = req.get_json()
        logging.info("Request JSON parsed successfully.")
    except ValueError:
        logging.error("Invalid JSON in request.")
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON"}),
            status_code=400,
            mimetype="application/json"
        )

    text = req_body.get("text")
    if not text or not isinstance(text, str) or len(text.strip()) < 20:
        logging.warning("Invalid or too short 'text' field in request.")
        return func.HttpResponse(
            json.dumps({"error": "Please provide a valid 'text' field with at least 20 characters."}),
            status_code=400,
            mimetype="application/json"
        )

    try:
        ppl = calculate_perplexity(text, model, tokenizer)
        score = 0
        if ppl >= 80:
            score = 0
        elif ppl <= 60:
            score = 5
        else:
            score = 5 - ((ppl - 60) / 20) * 5
        label = ai_label(ppl)
        logging.info("Returning score: %f, label: %s", score, label)
        return func.HttpResponse(
            json.dumps({
                "score": score,
                "label": label
            }),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logging.exception("Exception occurred during processing.")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
