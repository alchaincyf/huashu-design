# Huashu Design Studio Web UI

Local web interface for the `huashu-design` skill.

## Run

```bash
cd /Users/judeokun/Documents/GitHub/huashu-design/webui
npm install
npm run dev
```

Open:

```text
http://localhost:5177
```

## Providers

- Ollama Local: `http://localhost:11434/v1`
- Ollama Cloud: `https://ollama.com/v1`
- OpenAI-compatible APIs: any `/v1/chat/completions` endpoint
- Anthropic: native `/v1/messages` endpoint

Local Ollama normally does not need a real API key. Some SDKs require a non-empty value, but Ollama ignores it. Ollama Cloud and hosted proxy gateways require a real key.

API keys are sent to the server for the current generation request but are not persisted in browser local storage by this UI.

## Notes

The UI reads skill context from the parent repo and sends it to the selected model with your brief. Generated HTML appears in the preview iframe and editable code tab.
