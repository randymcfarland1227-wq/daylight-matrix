# Ingredient prep workspace

Food is organized around ingredient batches and eating options, rather than a weekly schedule of fixed meals. The original recipes, saved food options, inventory, prep tasks and food logs remain available. Body is unchanged in this update.

## Daily flow

1. Ingredient prep: select batches, edit ingredient names and notes, optionally record batch amount and storage. Review ingredients and staples before shopping.
2. Shopping: only selected prep contributes ingredients. Missing non-staple ingredients are checked for review; uncertain stock and staples need explicit selection. Confirm to add items. Quantities are user-entered; serving counts are not converted into purchase amounts. Manual extras remain possible.
3. Buy and put away: mark bought, put into inventory, then adjust storage/category there. Archived list items can be restored.
4. Prepare: mark a batch prepared. Its ingredients appear in Food options; mark used up when finished or start another batch.
5. Eat: select ready/on-hand ingredients to find saved options using at least one selected ingredient. Review recipe details, log an option, or log a personal combination. Selecting an option does not purchase or consume ingredients automatically.

## Inventory

Fridge, Freezer and Pantry expand into categories, which expand into editable items. Category and storage are independent. Existing Cabinet/cupboard locations display as Pantry without rewriting source data. Search and the use-soon/low filters preserve manual expansion control. Unknown quantities remain unknown. Low/out items do not automatically create groceries.

## Data compatibility

Persistence keeps `daylight-matrix-v1` and schema 3. Additive foodWorkspaceVersion 1 runs once during hydration/import. Only unchanged, unchecked generated starter shopping entries are archived. Edited, bought and custom entries remain active. Archives can be restored. Prepared batches snapshot ingredient names, amount, storage and local date; legacy batches resolve ingredients through their prep task. Weekly meal-plan data remains in backups but is no longer the Food interface.

## Verification

Automated coverage checks migration safety/idempotence, selected-only ingredient deduplication, explicit staple selection, unknown quantities, multiple inventory lots, prepared snapshots/legacy batches and storage/category normalization. Browser checks cover selection → review → build → bought → inventory, prepared ingredients → varied options, reload, and phone layout. Development-origin test data is separate from the user’s preview-origin data. Review branches are updated without merging or publishing production.
