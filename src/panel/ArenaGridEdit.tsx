import { Divider, Field } from '@fluentui/react-components';
import {
    CircleFilled,
    CircleRegular,
    GridFilled,
    GridRegular,
    SquareFilled,
    SquareHintFilled,
    SquareHintRegular,
    SquareRegular,
    bundleIcon,
} from '@fluentui/react-icons';
import React, { useCallback, useState } from 'react';
import { DeferredInput } from '../DeferredInput';
import { InfoField } from '../InfoField';
import { useScene } from '../SceneProvider';
import { Segment, SegmentedGroup } from '../Segmented';
import { SpinButton } from '../SpinButton';
import { SpinButtonUnits } from '../SpinButtonUnits';
import { ThreeQuarterCircleFilled, ThreeQuarterCircleRegular } from '../icon/ThreeQuarterCircle';
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
import { useControlStyles } from '../useControlStyles';

const SquareHintIcon = bundleIcon(SquareHintFilled, SquareHintRegular);
const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const DataPieIcon = bundleIcon(ThreeQuarterCircleFilled, ThreeQuarterCircleRegular);
const SquareIcon = bundleIcon(SquareFilled, SquareRegular);
const GridIcon = bundleIcon(GridFilled, GridRegular);

function formatCustomGridRows(grid: Grid) {
    return grid.type === GridType.CustomRectangular ? grid.rows.join(' ') : '';
}

function formatCustomGridCols(grid: Grid) {
    return grid.type === GridType.CustomRectangular ? grid.columns.join(' ') : '';
}

function formatCustomGridRings(grid: Grid) {
    return grid.type === GridType.CustomRadial ? grid.rings.join(' ') : '';
}

function formatCustomGridSpokes(grid: Grid) {
    return grid.type === GridType.CustomRadial ? grid.spokes.join(' ') : '';
}

function parseCustomGrid(text?: string): number[] {
    if (!text) {
        return [];
    }

    return text
        .split(/[,\s]/)
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

export const ArenaGridEdit: React.FC = () => {
    const classes = useControlStyles();
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

    const onTypeChange = useCallback(
        (option?: GridType) => {
            switch (option) {
                case GridType.None:
                    setGrid(NO_GRID);
                    break;

                case GridType.Rectangular:
                    setGrid(DEFAULT_RECT_GRID);
                    break;

                case GridType.Radial:
                    setGrid(DEFAULT_RADIAL_GRID);
                    break;

                case GridType.CustomRectangular:
                    setGrid(DEFAULT_CUSTOM_RECT_GRID);
                    setCustomRows(DEFAULT_CUSTOM_RECT_GRID.rows.join(' '));
                    setCustomCols(DEFAULT_CUSTOM_RECT_GRID.columns.join(' '));
                    break;

                case GridType.CustomRadial:
                    setGrid(DEFAULT_CUSTOM_RADIAL_GRID);
                    setCustomRings(DEFAULT_CUSTOM_RADIAL_GRID.rings.join(' '));
                    setCustomSpokes(DEFAULT_CUSTOM_RADIAL_GRID.spokes.join(' '));
                    break;
            }
        },
        [setGrid, setCustomRows, setCustomCols, setCustomRings, setCustomSpokes],
    );

    return (
        <div className={classes.column}>
            <Field label="Grid type">
                <SegmentedGroup
                    name="arena-grid"
                    value={grid.type}
                    onChange={(ev, data) => onTypeChange(data.value as GridType)}
                >
                    <Segment value={GridType.None} icon={<SquareHintIcon />} title="None" />
                    <Segment value={GridType.Radial} icon={<CircleIcon />} title="Radial" />
                    <Segment value={GridType.CustomRadial} icon={<DataPieIcon />} title="Custom radial" />
                    <Segment value={GridType.Rectangular} icon={<SquareIcon />} title="Rectangular" />
                    <Segment value={GridType.CustomRectangular} icon={<GridIcon />} title="Custom rectangular" />
                </SegmentedGroup>
            </Field>
            {grid.type === GridType.Rectangular && (
                <div className={classes.row}>
                    <Field label="Columns">
                        <SpinButton
                            min={1}
                            max={100}
                            step={1}
                            value={grid.columns}
                            onChange={(ev, data) => {
                                if (data.value) {
                                    setGrid({ ...grid, columns: data.value });
                                }
                            }}
                        />
                    </Field>
                    <Field label="Rows">
                        <SpinButton
                            min={1}
                            max={100}
                            step={1}
                            value={grid.rows}
                            onChange={(ev, data) => {
                                if (data.value) {
                                    setGrid({ ...grid, rows: data.value });
                                }
                            }}
                        />
                    </Field>
                </div>
            )}
            {grid.type === GridType.Radial && (
                <>
                    <div className={classes.row}>
                        <Field label="Spokes">
                            <SpinButton
                                min={1}
                                max={360}
                                step={1}
                                value={grid.angularDivs}
                                onChange={(ev, data) => {
                                    if (data.value) {
                                        setGrid({ ...grid, angularDivs: data.value });
                                    }
                                }}
                            />
                        </Field>
                        <Field label="Rings">
                            <SpinButton
                                min={1}
                                max={100}
                                step={1}
                                value={grid.radialDivs}
                                onChange={(ev, data) => {
                                    if (data.value) {
                                        setGrid({ ...grid, radialDivs: data.value });
                                    }
                                }}
                            />
                        </Field>

                        <Field label="Rotation">
                            <SpinButtonUnits
                                min={-180}
                                max={180}
                                step={5}
                                roundTo={0.5}
                                suffix="°"
                                value={grid.startAngle ?? 0}
                                onChange={(ev, data) => {
                                    if (typeof data.value === 'number') {
                                        setGrid({ ...grid, startAngle: data.value });
                                    }
                                }}
                            />
                        </Field>
                    </div>
                </>
            )}
            {grid.type === GridType.CustomRectangular && (
                <>
                    <InfoField label="Row stops" info="Enter a space-separated list of Y coordinates for grid lines.">
                        <DeferredInput
                            value={customRows}
                            onChange={(ev, data) => {
                                setCustomRows(data.value);
                                setGrid({ ...grid, rows: parseCustomGrid(data.value) });
                            }}
                        />
                    </InfoField>
                    <InfoField
                        label="Column stops"
                        info="Enter a space-separated list of X coordinates for grid lines."
                    >
                        <DeferredInput
                            value={customCols}
                            onChange={(ev, data) => {
                                setCustomCols(data.value);
                                setGrid({ ...grid, columns: parseCustomGrid(data.value) });
                            }}
                        />
                    </InfoField>
                </>
            )}
            {grid.type === GridType.CustomRadial && (
                <>
                    <InfoField label="Ring stops" info="Enter a space-separated list of radii for grid rings.">
                        <DeferredInput
                            value={customRings}
                            onChange={(ev, data) => {
                                setCustomRings(data.value);
                                setGrid({ ...grid, rings: parseCustomGrid(data.value) });
                            }}
                        />
                    </InfoField>
                    <InfoField
                        label="Spoke angles"
                        info="Enter a space-separated list of angles in degrees for grid spokes."
                    >
                        <DeferredInput
                            value={customSpokes}
                            onChange={(ev, data) => {
                                setCustomSpokes(data.value);
                                setGrid({ ...grid, spokes: parseCustomGrid(data.value) });
                            }}
                        />
                    </InfoField>
                </>
            )}
            {grid.type !== GridType.None && <Divider />}
        </div>
    );
};
