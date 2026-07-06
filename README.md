# Deepsea Trawl Fishing Log

An offline data-collection app for fisheries observers. It replaces the paper
**Deepsea Trawl Fishing Log (Freezer)** logbook with a tablet-friendly digital
version — enter a trip's data on the same forms you already know, then export it
to Excel or save it as a PDF.

**Live app:** https://fariedd.github.io/fishing-logbooks/

## What it does

- **Start a trip** and fill in the cover (vessel, skipper, permits, dates).
- **Add sheets** as the trip needs them — *Header Information per Activity Period*
  and *Estimated Catch per Day* — laid out just like the printed logbook.
- **Totals calculate automatically** on the catch sheet.
- **Trip Overview** — scroll through every page of the trip and edit inline.
- **Export to Excel** or **Save as PDF** (one page per section).
- **Bin** — deleted trips are kept for 7 days before being permanently removed,
  and can be restored in the meantime.

## Works offline

Everything runs in the browser and saves to the device — no internet or account
needed. Data stays on the tablet it was entered on. On a tablet you can tap
"Add to Home Screen" to use it like an installed app.

## Running it locally

It's plain HTML/CSS/JavaScript — no build step. Serve the folder with any static
web server, for example in VS Code with the **Live Server** extension, then open
`index.html`.

## Status

Currently supports the **Freezer** logbook. Wetfish is planned.
