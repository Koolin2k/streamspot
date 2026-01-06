# Testing StreamSpot on Your iPhone

## Quick Setup

### 1. Start the Development Server

On your computer (in the `project/` directory):
```bash
cd project
npm run dev
```

You should see output like:
```
- Local:        http://localhost:3000
- Network:      http://192.168.1.XXX:3000
```

**Important**: Look for the "Network" URL - this is what you'll use on your iPhone.

### 2. Find Your Computer's IP Address

If you don't see the Network URL, find your IP manually:

**On Mac:**
```bash
ipconfig getifaddr en0
```

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (usually starts with 192.168.X.X or 10.0.X.X)

**On Linux:**
```bash
hostname -I | awk '{print $1}'
```

### 3. Connect Your iPhone

1. **Make sure your iPhone is on the same WiFi network** as your computer
2. **Open Safari** on your iPhone (or Chrome)
3. **Type in the address bar**: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.145:3000`
4. **Allow location permissions** when prompted (required for nearby events feature)

### 4. Test the Features

Once loaded, test:
- ✅ **Home page** - Should auto-detect your location and show nearby events
- ✅ **Venues page** - Toggle between List and Map view
- ✅ **Map markers** - Tap markers to see venue popups
- ✅ **Distance display** - Events should show distance from your location
- ✅ **Category filters** - Filter events by Sports, TV, Culture

## Troubleshooting

### "Can't connect" or "Site can't be reached"

1. Verify both devices are on the **same WiFi network**
2. Check your computer's firewall isn't blocking port 3000
3. Try accessing from your computer's browser first: `http://localhost:3000`

**On Mac** - Allow Node.js through firewall:
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### Location not working

1. Make sure you allowed location permissions in Safari
2. Check Settings > Safari > Location Services is enabled
3. Try using Chrome/Brave if Safari has issues
4. The app falls back to DC coordinates if location is denied

### Map not loading

1. Check that your Mapbox token is in `.env.local`
2. Restart the dev server after adding the token
3. Check browser console for errors (Safari: Settings > Safari > Advanced > Web Inspector)

### Performance issues

- Close other tabs/apps to free up memory
- Try hard refresh: tap the refresh button or close and reopen Safari
- Maps can be heavy - the list view is lighter weight

## Using HTTPS (Advanced)

For better testing of location features, you can use a tunnel service:

### Option 1: ngrok (Free)
```bash
npx ngrok http 3000
```
Then use the https:// URL provided (e.g., `https://abc123.ngrok.io`)

### Option 2: Cloudflare Tunnel (Free)
```bash
npx cloudflared tunnel --url http://localhost:3000
```

HTTPS URLs work better with location permissions on iOS!

## Quick Tips

- 📱 Add to Home Screen for app-like experience (Safari menu > Share > Add to Home Screen)
- 🔄 Pull down to refresh on iOS
- 🗺️ Use two fingers to zoom/pan the map
- 📍 Tap the location button on the map to center on your position
- 🔍 Test in different parts of DC to see location-based filtering work

## Common IP Address Ranges

- **Home WiFi**: Usually 192.168.X.X or 10.0.X.X
- **Office/Corporate**: Often 10.X.X.X or 172.16.X.X
- **Public WiFi**: Varies widely

Your IP will look something like:
- `192.168.1.145:3000`
- `10.0.0.42:3000`
- `172.16.254.12:3000`

---

**Need help?** Check that:
1. ✅ Dev server is running (`npm run dev`)
2. ✅ Both devices on same WiFi
3. ✅ Using the correct IP:PORT (e.g., `192.168.1.X:3000`)
4. ✅ Location permissions granted in Safari
5. ✅ `.env.local` has all tokens configured
