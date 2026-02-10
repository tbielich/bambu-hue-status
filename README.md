# Bambu Hue Status

Control Philips Hue lights based on the print status of a Bambu Lab A1 mini.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Pair with your Hue Bridge to get an app key:

```bash
npm run hue:pair
```

3. List Hue lights and copy the IDs you want to control:

```bash
npm run hue:list
```

4. Create/update `.env`:

```env
HUE_BRIDGE_IP=192.168.1.10
HUE_APP_KEY=PASTE_HUE_APP_KEY_HERE
HUE_LIGHT_IDS=7,12

# Local printer connection (required by @hiv3d/bambu-node)
BAMBU_HOST=192.168.1.50
BAMBU_PRINTER_SN=your-printer-serial
BAMBU_ACCESS_CODE=your-access-code

# Kept for compatibility if you later switch to a cloud client
BAMBU_REGION=EU
BAMBU_EMAIL=your@email.com
BAMBU_PASSWORD=your-password
```

5. Start the listener:

```bash
npm start
```

## Behavior

- When a print starts, Hue lights are set to red.
- When a print finishes successfully, Hue lights are set to green.

## Notes

- Press the physical link button on the Hue Bridge before running `npm run hue:pair`.
- `HUE_LIGHT_IDS` accepts a comma-separated list of light IDs.
- `@hiv3d/bambu-node` connects locally to the printer IP and does not use Bambu Cloud credentials.
