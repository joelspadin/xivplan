import { DefaultButton, IChoiceGroupOption, IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { CompactChoiceGroup } from '../CompactChoiceGroup';
import { DeferredTextField } from '../DeferredTextField';
import {
    CustomGrid,
    DEFAULT_CUSTOM_GRID,
    DEFAULT_RADIAL_GRID,
    DEFAULT_RECT_GRID,
    Grid,
    GridType,
    NO_GRID,
} from '../scene';
import { useScene } from '../SceneProvider';
import { SpinButtonUnits } from '../SpinButtonUnits';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const gridShapes: IChoiceGroupOption[] = [
    { key: GridType.None, text: 'None', iconProps: { iconName: 'BorderDot' } },
    // TODO: use CircleShape and SquareShape whenever icon font gets fixed.
    { key: GridType.Radial, text: 'Radial', iconProps: { iconName: 'CircleRing' } },
    // TODO: use BorderAll whenever icon font gets fixed.
    { key: GridType.Rectangular, text: 'Square', iconProps: { iconName: 'GridViewSmall' } },
    // TODO: use DynamicList whenever icon font gets fixed.
    { key: GridType.Custom, text: 'Custom', iconProps: { iconName: 'TextField' } },
];

function formatCustomGridRows(grid: Grid) {
    return grid.type === GridType.Custom ? grid.rows.join(', ') : '';
}

function formatCustomGridCols(grid: Grid) {
    return grid.type === GridType.Custom ? grid.columns.join(', ') : '';
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

function didCustomGridChange(grid: CustomGrid, rowsText: string, colsText: string) {
    return (
        JSON.stringify(grid.rows) !== JSON.stringify(parseCustomGrid(rowsText)) ||
        JSON.stringify(grid.columns) !== JSON.stringify(parseCustomGrid(colsText))
    );
}

export const ArenaGridEdit: React.FunctionComponent = () => {
    const [scene, dispatch] = useScene();
    const grid = scene.arena.grid;

    const setGrid = useCallback(
        (grid: Grid) => {
            dispatch({ type: 'arenaGrid', value: grid });
        },
        [dispatch],
    );

    const [customRows, setCustomRows] = useState(formatCustomGridRows(grid));
    const [customCols, setCustomCols] = useState(formatCustomGridCols(grid));

    useEffect(() => {
        if (grid.type === GridType.Custom && didCustomGridChange(grid, customRows, customCols)) {
            setCustomRows(formatCustomGridRows(grid));
            setCustomCols(formatCustomGridCols(grid));
        }
    }, [grid, customRows, customCols, setCustomRows, setCustomCols]);

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

                case GridType.Custom:
                    setGrid(DEFAULT_CUSTOM_GRID);
                    setCustomRows(DEFAULT_CUSTOM_GRID.rows.join(', '));
                    setCustomCols(DEFAULT_CUSTOM_GRID.columns.join(', '));
                    return;
            }
        },
        [setGrid],
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
            {grid.type === GridType.Custom && (
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
        </Stack>
    );
};
