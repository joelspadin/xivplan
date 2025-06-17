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

## Credits

Undo/redo logic is based on [frontendphil/react-undo-redo](https://github.com/frontendphil/react-undo-redo)

Job, role, waymark, and enemy icons are © SQUARE ENIX CO., LTD. All Rights Reserved.

[Limit cut counter icons](https://magentalava.gumroad.com/l/limitcuticons) by yullanellis.

Some [arena background images](https://github.com/kotarou3/ffxiv-arena-images) by kotarou3.
