# Final Fantasy XIV Raid Planner

https://xivplan.netlify.app/

This is a tool for quickly diagramming raid strategies for Final Fantasy XIV, inspired by [RaidPlan.io](https://raidplan.io).

## Usage

Click **Help** in the upper-right or press F1 to see an explanation of the UI and a list of keyboard and mouse shortcuts.

The left panel lets you adjust the appearance of the arena and add objects to it by dragging and dropping them onto the arena.

Click an object in the scene to select it. Drag one of the handles that appears to adjust the object's size and shape, or drag elsewhere on the object to move it.

The right panel shows a list of all objects in the current scene. You can select and delete objects here, and you can drag and drop objects in the list to change the layer in which they are ordered (objects at the top of the list render above ones at the bottom).

The right panel also lets you change detailed properties of the selected objects. If multiple objects are selected, then you can change any property shared by all of the objects. If a property's control does not show a value, that means the selected objects have different values for that property.

At the top of the view, you can add new steps to the plan and switch between steps.

### Saving and Sharing Plans

All plans are stored locally on your PC. If you are using a Chromium-based browser, you can save directly to files on your PC. Otherwise, you can use browser storage. If using browser storage, be sure not to clear browsing data for this site, or you will lose all your plans!

Using local storage means I don't have to pay for servers, and I can't mess up and accidentally delete your plans, but sharing plans is more difficult. Click the **Share** button at the top to get a sharable link. The entire plan file is encoded in the link, so if it is too large to share, you can also download the plan as an .xivplan file and share that. To open a shared file, simply drag and drop it onto the page.

If you are using a Chromium-based browser and you install the site as an app, then .xivplan files can also be opened directly in the app instead of using drag and drop.

You can also self-host plans. XIVPlan can fetch an .xivplan file from any public URL if you navigate to `https://xivplan.netlify.app/?url=` followed by the link to the plan. Make sure that you are serving the raw JSON file or it will fail to load.

### Background Images

When loading an SVG file as the arena background image, XIVPlan will inject the following CSS variables:

| Variable                     | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| `--xiv-colorBackground`      | Color of the background outside the arena.                   |
| `--xiv-colorArena`           | Color of the arena floor.                                    |
| `--xiv-colorArenaLight`      | A slightly lighter arena floor color.                        |
| `--xiv-colorArenaDark`       | A slightly darker arena floor color.                         |
| `--xiv-colorBorder`          | Color of the border around the arena floor.                  |
| `--xiv-colorBorderTickMajor` | Color of the major tick marks when border ticks are enabled. |
| `--xiv-colorBorderTickMinor` | Color of the minor tick marks when border ticks are enabled. |
| `--xiv-colorGrid`            | Color of grid lines.                                         |

## Alternatives

[RaidPlan.io](https://raidplan.io/ffxiv) now supports FFXIV.

[FF14 Toolbox Gaming Space](https://ff14.toolboxgaming.space) is a more powerful tool that supports animations and much more. I find its UI cumbersome to use though, so it is not well suited to quickly diagramming during raids.

## Development

Building and testing this project requires [Node.js](https://nodejs.org/).

Clone this repo, open a terminal to the folder where you cloned it, and run the following command to install dependencies:

```sh
npm install
```

To start the development version of the site, run this command:

```sh
npm run dev
```

It will print a URL such as http://127.0.0.1:5173/. Open it in your browser.

### Icons from FFXIV

Many of the icons are copied directly or derived from Final Fantasy XIV game assets. To make sure icons are processed consistently when they are updated, for example when new jobs are added, I made a separate tool for extracting and editing icons. See https://github.com/joelspadin/xivplan-icon-generator for more details.

If you want to add a new image from a game asset, please do not use images that were extracted and possibly modified by other people. First, make a PR to add it to the icon generator. Then use the icon generator to extract it directly from the game and resize it as needed. Then you can include the result of that in a PR.

## Credits

Undo/redo logic is based on [frontendphil/react-undo-redo](https://github.com/frontendphil/react-undo-redo)

Job, role, marker, and enemy icons are © SQUARE ENIX CO., LTD. All Rights Reserved.

[Limit cut counter icons](https://magentalava.gumroad.com/l/limitcuticons) by yullanellis.

Some [arena background images](https://github.com/kotarou3/ffxiv-arena-images) by kotarou3.
