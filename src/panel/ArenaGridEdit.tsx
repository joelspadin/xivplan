import { DefaultButton, IChoiceGroupOption, IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { CompactChoiceGroup } from '../CompactChoiceGroup';
import { DeferredTextField } from '../DeferredTextField';
import { useScene } from '../SceneProvider';
import { SpinButtonUnits } from '../SpinButtonUnits';
import {
    CustomRadialGrid,
    CustomRectangularGrid,
    DEFAULT_CUSTOM_RADIAL_GRID,
    DEFAULT_CUSTOM_RECT_GRID,
    DEFAULT_RADIAL_GRID,
    DEFAULT_RECT_GRID,
    Grid,
    GridType,
    NO_GRID,
} from '../scene';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const gridShapes: IChoiceGroupOption[] = [
    { key: GridType.None, text: 'None', iconProps: { iconName: 'BorderDot' } },
    // TODO: use CircleShape and SquareShape whenever icon font gets fixed.
    { key: GridType.Radial, text: 'Radial', iconProps: { iconName: 'CircleRing' } },
    // TODO: use DynamicList whenever icon font gets fixed.
    { key: GridType.CustomRadial, text: 'Custom Radial', iconProps: { iconName: 'ThreeQuarterCircle' } },
    // TODO: use BorderAll whenever icon font gets fixed.
    { key: GridType.Rectangular, text: 'Square', iconProps: { iconName: 'GridViewSmall' } },
    // TODO: use DynamicList whenever icon font gets fixed.
    { key: GridType.CustomRectangular, text: 'Custom Square', iconProps: { iconName: 'FiveTileGrid' } },
];

function formatCustomGridRows(grid: Grid) {
    return grid.type === GridType.CustomRectangular ? grid.rows.join(', ') : '';
}

function formatCustomGridCols(grid: Grid) {
    return grid.type === GridType.CustomRectangular ? grid.columns.join(', ') : '';
}

function formatCustomGridRings(grid: Grid) {
    return grid.type === GridType.CustomRadial ? grid.rings.join(', ') : '';
}

function formatCustomGridSpokes(grid: Grid) {
    return grid.type === GridType.CustomRadial ? grid.spokes.join(', ') : '';
}

function parseCustomGrid(text?: string): number[] {
    if (!text) {
        return [];
    }

    return text
        .split(',')
        .map((x) => parseInt(x))
        .filter((x) => !isNaN(x));
}

function didCustomRectGridChange(grid: CustomRectangularGrid, rowsText: string, colsText: string) {
    return (
        JSON.stringify(grid.rows) !== JSON.stringify(parseCustomGrid(rowsText)) ||
        JSON.stringify(grid.columns) !== JSON.stringify(parseCustomGrid(colsText))
    );
}

function didCustomRadialGridChange(grid: CustomRadialGrid, ringsText: string, spokesText: string) {
    return (
        JSON.stringify(grid.rings) !== JSON.stringify(parseCustomGrid(ringsText)) ||
        JSON.stringify(grid.spokes) !== JSON.stringify(parseCustomGrid(spokesText))
    );
}

export const ArenaGridEdit: React.FunctionComponent = () => {
    const { scene, dispatch } = useScene();
    const grid = scene.arena.grid;

    const setGrid = useCallback(
        (grid: Grid) => {
            dispatch({ type: 'arenaGrid', value: grid });
        },
        [dispatch],
    );

    // TODO: refactor custom grids into their own components
    const [customRows, setCustomRows] = useState(formatCustomGridRows(grid));
    const [customCols, setCustomCols] = useState(formatCustomGridCols(grid));
    const [customRings, setCustomRings] = useState(formatCustomGridRings(grid));
    const [customSpokes, setCustomSpokes] = useState(formatCustomGridSpokes(grid));

    useEffect(() => {
        switch (grid.type) {
            case GridType.CustomRectangular:
                if (didCustomRectGridChange(grid, customRows, customCols)) {
                    setCustomRows(formatCustomGridRows(grid));
                    setCustomCols(formatCustomGridCols(grid));
                }
                break;

            case GridType.CustomRadial:
                if (didCustomRadialGridChange(grid, customRings, customSpokes)) {
                    setCustomRings(formatCustomGridRings(grid));
                    setCustomSpokes(formatCustomGridSpokes(grid));
                }
                break;
        }
    }, [
        grid,
        customRows,
        customCols,
        setCustomRows,
        setCustomCols,
        customRings,
        customSpokes,
        setCustomRings,
        setCustomSpokes,
    ]);

    const onTypeChange = useCallback(
        (option?: GridType) => {
            switch (option) {
                case GridType.None:
                    setGrid(NO_GRID);
                    return;

                case GridType.Rectangular:
                    setGrid(DEFAULT_RECT_GRID);
                    return;

                case GridType.Radial:
                    setGrid(DEFAULT_RADIAL_GRID);
                    return;

                case GridType.CustomRectangular:
                    setGrid(DEFAULT_CUSTOM_RECT_GRID);
                    setCustomRows(DEFAULT_CUSTOM_RECT_GRID.rows.join(', '));
                    setCustomCols(DEFAULT_CUSTOM_RECT_GRID.columns.join(', '));
                    return;

                case GridType.CustomRadial:
                    setGrid(DEFAULT_CUSTOM_RADIAL_GRID);
                    setCustomRings(DEFAULT_CUSTOM_RADIAL_GRID.rings.join(', '));
                    setCustomSpokes(DEFAULT_CUSTOM_RADIAL_GRID.spokes.join(', '));
            }
        },
        [setGrid, setCustomRows, setCustomCols, setCustomRings, setCustomSpokes],
    );

    return (
        <Stack tokens={stackTokens}>
            <CompactChoiceGroup
                label="Grid type"
                options={gridShapes}
                selectedKey={grid.type}
                onChange={(e, option) => onTypeChange(option?.key as GridType)}
            />
            {grid.type === GridType.Rectangular && (
                <Stack horizontal tokens={stackTokens}>
                    <SpinButton
                        label="Rows"
                        labelPosition={Position.top}
                        min={1}
                        step={1}
                        value={grid.rows.toString()}
                        onChange={(ev, newValue) => {
                            newValue && setGrid({ ...grid, rows: parseInt(newValue) });
                        }}
                    />
                    <SpinButton
                        label="Columns"
                        labelPosition={Position.top}
                        min={1}
                        step={1}
                        value={grid.columns.toString()}
                        onChange={(ev, newValue) => {
                            newValue && setGrid({ ...grid, columns: parseInt(newValue) });
                        }}
                    />
                </Stack>
            )}
            {grid.type === GridType.Radial && (
                <>
                    <Stack horizontal tokens={stackTokens}>
                        <SpinButton
                            label="Spokes"
                            labelPosition={Position.top}
                            min={1}
                            step={1}
                            value={grid.angularDivs.toString()}
                            onChange={(ev, newValue) => {
                                newValue && setGrid({ ...grid, angularDivs: parseInt(newValue) });
                            }}
                        />
                        <SpinButton
                            label="Rings"
                            labelPosition={Position.top}
                            min={1}
                            step={1}
                            value={grid.radialDivs.toString()}
                            onChange={(ev, newValue) => {
                                newValue && setGrid({ ...grid, radialDivs: parseInt(newValue) });
                            }}
                        />
                    </Stack>
                    <Stack horizontal verticalAlign="end" tokens={stackTokens}>
                        <SpinButtonUnits
                            label="Rotation"
                            labelPosition={Position.top}
                            min={-180}
                            max={180}
                            step={5}
                            suffix="°"
                            value={grid.startAngle?.toString() ?? '0'}
                            onChange={(ev, newValue) => {
                                setGrid({ ...grid, startAngle: parseInt(newValue ?? '0') });
                            }}
                        />
                        <DefaultButton text="Reset" onClick={() => setGrid({ ...grid, startAngle: undefined })} />
                    </Stack>
                </>
            )}
            {grid.type === GridType.CustomRectangular && (
                <>
                    <DeferredTextField
                        label="Row stops"
                        value={customRows}
                        onChange={(newValue) => {
                            setCustomRows(newValue ?? '');
                            setGrid({ ...grid, rows: parseCustomGrid(newValue) });
                        }}
                    />
                    <DeferredTextField
                        label="Column stops"
                        value={customCols}
                        onChange={(newValue) => {
                            setCustomRows(newValue ?? '');
                            setGrid({ ...grid, columns: parseCustomGrid(newValue) });
                        }}
                    />
                </>
            )}
            {grid.type === GridType.CustomRadial && (
                <>
                    <DeferredTextField
                        label="Ring stops"
                        value={customRings}
                        onChange={(newValue) => {
                            setCustomRows(newValue ?? '');
                            setGrid({ ...grid, rings: parseCustomGrid(newValue) });
                        }}
                    />
                    <DeferredTextField
                        label="Spoke angles"
                        value={customSpokes}
                        onChange={(newValue) => {
                            setCustomRows(newValue ?? '');
                            setGrid({ ...grid, spokes: parseCustomGrid(newValue) });
                        }}
                    />
                </>
            )}
        </Stack>
    );
};
