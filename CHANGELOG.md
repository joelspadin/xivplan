# Changelog

This page tracks notable changes made to XIVPlan. Not every change will be listed here.

## Jun 14, 2025

- Fixed shotcut keys for creating tethers.
- Updated all object types to support transparency.
- Objects can now be shown/hidden with the `H` key, clicking the button next to the opacity slider, or clicking the button on the item in the scene list.

## Jun 10, 2025

- Added an enemy ring type that shows the full circle ring with a direction indicator.
- Added an option for hiding the arena background.
- Added arena presets for Arcadion M6.
- Added a remaining arena preset for Arcadion M7.
- Added arena presets for Arcadion M8.
- Fixed an issue where enemy rings were slightly larger than the specified radius.

## Apr 28, 2025

- Added arena presets for some parts of Arcadion M7.

## Mar 30, 2025

- Added an options menu to the screenshot button with options to increase the screenshot resolution.
- Fixed arc objects not supporting hollow style
- Changed the minimum arena padding to 0

## Mar 23, 2025

- Angle and rotation fields now support typing in values with one decimal place.

## Mar 19, 2025

- Fixed searching for statuses with spaces in their names.

## Dec 16, 2024

- Fixed an issue where typing into the line zone width/height fields didn't work.
- Fixed an issue where object positions weren't rounded to integers when the OS display scaling was set to a value other than 100%.

## Nov 30, 2040

- Added an option to display tick marks, similar to those used in ultimates, around the edge of the arena.

## Oct 27, 2024

- Changed the line AOE object to pivot about one end, making it easier to place lines that originate from a point.
  - Line AOEs in existing plans will continue to behave like rectangle AOEs.
- Added `Ctrl+Shift+V` to paste objects in their original locations.
  - This can be useful when copying objects between steps.
- Reduced the step size on the rotation control from 15 degrees to 5 degrees.
- Fixed `Esc` not cancelling confirmation prompts.

## Sep 8, 2024

- Added a control to adjust the spacing of moving AOE objects.
  - Changed the default spacing from 60% to 50%.
- Changed the minimum moving AOE trail length from 2 to 1.
- Reduced the step size on X and Y controls from 10 to 1.
- Reduced the step size on width and height controls from 10 to 5.
- Added an arena preset for Arcadion M4.

## Sep 4, 2024

- Added an icon to represent either healer or tank.

## Aug 2, 2024

- Updated to the latest XIVAPI version for status search.

## Jul 29, 2024

- Added the current file name to the page header
- Fixed an issue where saving to a new file and pressing undo would revert to saving to the previous file.

## Jul 28, 2024

- Removed a grid from the Arcadion M3 arena preset that doesn't exist in the floor pattern.

## Jul 27, 2024

- Added arena presets for Arcadion M2, M3.

## Jul 20, 2024

- Added a color swatch that matches the dark theme background color

## Jul 19, 2024

- Arena presets associated with specific instances are now blurred and may have names adjusted or redacted to avoid spoilers.
  - Clicking a preset will reveal it.
  - Checking the "show all presets" checkbox will reveal all presets.
- Adjusted some arena presets for ultimates for even better visibility.
- Added an arena preset a unique arena in Dawntrail's second extreme trial.

## Jul 14, 2024

- Added a "duration" property to icon objects so you can now indicate the durations of status effects.

## Jul 9, 2024

- Added a screenshot button.

## Jul 4, 2024

- Adjusted some arena presets for ultimates for better visibility.

## Jul 3, 2024

- Added a "stacks" property to icon objects which have a stack counter, so you can now adjust the counter.

## Jun 29, 2024

- Added Viper, Pictomancer, and Blue Mage icons.

## Jun 25, 2024

- Fixed an issue where entering "0" on a spin button control did not change the value to 0.
- Fixed an issue where you could enter "NaN" or "Infinity" on a spin button control.

## Jun 23, 2024

- Added a file browser for opening local files.

## Jun 22, 2024

- Added a way to reorder steps.
- The step selector now properly wraps when there are too many steps.
- Fixed an issue where hotkeys could still affect the scene when a modal dialog was open.

## Jun 21, 2024

- Added an option to download an .xivplan file.
- Added support for dropping .xivplan files onto the app to open them.

## Jun 20, 2024

- Fixed an issue where all property controls could appear when nothing was selected.

## Jun 13, 2024

- Added initial support for opening and saving local files.
- If the site is installed as a PWA, it can directly open .xivplan files.

## Nov 19, 2023

- Added an opacity slider to enemy objects.

## Aug 29, 2023

- Added a language selector for status search.

## Aug 21, 2023

- Added a way to share a plan encoded in a URL.

## Jul 27, 2023

- Added a regular polygon zone.

## Jun 3, 2023

- Added support for editing properties on multiple objects at once.

## May 30, 2023

- Added support for custom radial grids.
