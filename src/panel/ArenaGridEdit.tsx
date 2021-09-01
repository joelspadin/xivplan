import { DefaultButton, Dropdown, IDropdownOption, IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { FormEvent, useCallback } from 'react';
import { DEFAULT_RADIAL_GRID, DEFAULT_RECT_GRID, Grid, GridType, NO_GRID } from '../scene';
import { useScene } from '../SceneProvider';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const gridShapes: IDropdownOption[] = [
    { key: GridType.None, text: 'None' },
    { key: GridType.RectangularGrid, text: 'Rectangular' },
    { key: GridType.RadialGrid, text: 'Radial' },
];

export const ArenaGridEdit: React.FunctionComponent = () => {
    const [scene, dispatch] = useScene();

    const setGrid = useCallback(
        (grid: Grid) => {
            dispatch({ type: 'arenaGrid', value: grid });
        },
        [dispatch],
    );

    const onTypeChange = useCallback(
        (ev: FormEvent<HTMLDivElement>, option?: IDropdownOption<GridType>) => {
            switch (option?.key) {
                case GridType.None:
                    setGrid(NO_GRID);
                    return;

                case GridType.RectangularGrid:
                    setGrid(DEFAULT_RECT_GRID);
                    return;

                case GridType.RadialGrid:
                    setGrid(DEFAULT_RADIAL_GRID);
                    return;
            }
        },
        [setGrid],
    );

    const grid = scene.arena.grid;

    return (
        <Stack tokens={stackTokens}>
            <Dropdown label="Grid" options={gridShapes} selectedKey={grid.type} onChange={onTypeChange} />
            {grid.type === GridType.RectangularGrid && (
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
            {grid.type === GridType.RadialGrid && (
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
                        <SpinButton
                            label="Start angle (degrees)"
                            labelPosition={Position.top}
                            min={-180}
                            max={180}
                            step={5}
                            value={grid.startAngle?.toString() ?? '0'}
                            onChange={(ev, newValue) => {
                                setGrid({ ...grid, startAngle: parseInt(newValue ?? '0') });
                            }}
                        />
                        <DefaultButton text="Reset" onClick={() => setGrid({ ...grid, startAngle: undefined })} />
                    </Stack>
                </>
            )}
        </Stack>
    );
};
