import { DefaultButton, Dropdown, IDropdownOption, IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { FormEvent, useCallback, useEffect, useState } from 'react';
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

const gridShapes: IDropdownOption[] = [
    { key: GridType.None, text: 'None' },
    { key: GridType.Rectangular, text: 'Rectangular' },
    { key: GridType.Radial, text: 'Radial' },
    { key: GridType.Custom, text: 'Custom' },
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
        (ev: FormEvent<HTMLDivElement>, option?: IDropdownOption<GridType>) => {
            switch (option?.key) {
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
            <Dropdown label="Grid" options={gridShapes} selectedKey={grid.type} onChange={onTypeChange} />
            {grid.type === GridType.Rectangular && (
                <Stack horizontal tokens={stackTokens}>
                    <SpinButton
                        label="Grid rows"
                        labelPosition={Position.top}
                        min={1}
                        step={1}
                        value={grid.rows.toString()}
                        onChange={(ev, newValue) => {
                            newValue && setGrid({ ...grid, rows: parseInt(newValue) });
                        }}
                    />
                    <SpinButton
                        label="Grid columns"
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
                            label="Angular divisions"
                            labelPosition={Position.top}
                            min={1}
                            step={1}
                            value={grid.angularDivs.toString()}
                            onChange={(ev, newValue) => {
                                newValue && setGrid({ ...grid, angularDivs: parseInt(newValue) });
                            }}
                        />
                        <SpinButton
                            label="Radial divisions"
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
                        label="Grid row stops"
                        value={customRows}
                        onChange={(newValue) => {
                            setCustomRows(newValue ?? '');
                            setGrid({ ...grid, rows: parseCustomGrid(newValue) });
                        }}
                    />
                    <DeferredTextField
                        label="Grid column stops"
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
