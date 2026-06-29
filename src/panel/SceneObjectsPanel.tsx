import {
    Button,
    Field,
    SpinButton,
    SpinButtonChangeEvent,
    SpinButtonOnChangeData,
    Text,
    ToggleButton,
    makeStyles,
    mergeClasses,
    tokens,
    typographyStyles,
} from '@fluentui/react-components';
import React, { useEffect } from 'react';
import { DEFAULT_FILTERS } from '../CrossStepContext';
import { useScene } from '../SceneProvider';
import { useAvailableFilters, useCrossStepSelection, useSelection, useSimilarObjects } from '../selection';
import { useControlStyles } from '../useControlStyles';
import { ObjectList } from './ObjectList';

export interface SceneObjectsPanelProps {
    className?: string;
}

export const SceneObjectsPanel: React.FC<SceneObjectsPanelProps> = ({ className }) => {
    const classes = useStyles();
    const controlClasses = useControlStyles();
    const { dispatch, step, stepIndex } = useScene();
    const [selection, setSelection] = useSelection();
    const available = useAvailableFilters();
    const { filters, setFilters, positionTolerance, setPositionTolerance, setSelection: setCrossStep } =
        useCrossStepSelection();

    // Clear all filters when selection is empty
    useEffect(() => {
        if (selection.size === 0) {
            setFilters(DEFAULT_FILTERS);
        }
    }, [selection, setFilters]);

    // Clear any filters that are no longer applicable to the current selection.
    // Return prev if values are unchanged to avoid a spurious context re-render.
    useEffect(() => {
        setFilters((prev) => {
            const trackId = prev.trackId && available.trackId;
            const properties = prev.properties && available.properties;
            const position = prev.position && available.position;
            if (trackId === prev.trackId && properties === prev.properties && position === prev.position) {
                return prev;
            }
            return { trackId, properties, position };
        });
    }, [available, setFilters]);

    const similar = useSimilarObjects(filters, positionTolerance);
    const filterMatches = similar.get(stepIndex);

    const anyFilterActive = filters.trackId || filters.properties || filters.position;
    const hasSelection = selection.size > 0;
    const showFilters = hasSelection;
    const showActions = anyFilterActive && similar.size > 0;

    const handleToleranceChange = (_: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
        setPositionTolerance(data.value ?? 0);
    };

    const handleSelectOnThisPage = () => {
        if (filterMatches) {
            setSelection(new Set(filterMatches));
        }
    };

    const handleSelectOnAllPages = () => {
        setCrossStep(similar);
    };

    const moveObject = (from: number, to: number) => {
        dispatch({ type: 'move', from, to });
    };

    return (
        <div className={mergeClasses(controlClasses.panel, controlClasses.noSelect, className)}>
            {showFilters && (
                <div className={classes.filterSection}>
                    <div className={classes.filterRow}>
                        <Text className={classes.filterLabel}>Select by:</Text>
                        <div className={classes.pillRow}>
                            {available.trackId && (
                                <ToggleButton
                                    size="small"
                                    checked={filters.trackId}
                                    onClick={() => setFilters((f) => ({ ...f, trackId: !f.trackId }))}
                                >
                                    Track ID
                                </ToggleButton>
                            )}
                            {available.properties && (
                                <ToggleButton
                                    size="small"
                                    checked={filters.properties}
                                    onClick={() => setFilters((f) => ({ ...f, properties: !f.properties }))}
                                >
                                    Size & Shape
                                </ToggleButton>
                            )}
                            {available.position && (
                                <ToggleButton
                                    size="small"
                                    checked={filters.position}
                                    onClick={() => setFilters((f) => ({ ...f, position: !f.position }))}
                                >
                                    + Position
                                </ToggleButton>
                            )}
                        </div>
                    </div>
                    {filters.position && (
                        <Field label="Tolerance (px)" orientation="horizontal" className={classes.toleranceField}>
                            <SpinButton
                                size="small"
                                value={positionTolerance}
                                min={0}
                                step={1}
                                onChange={handleToleranceChange}
                            />
                        </Field>
                    )}
                    {showActions && (
                        <div className={classes.actionRow}>
                            <Button
                                size="small"
                                appearance="subtle"
                                onClick={handleSelectOnThisPage}
                                disabled={!filterMatches?.size}
                            >
                                Select on this page
                            </Button>
                            <Button size="small" appearance="subtle" onClick={handleSelectOnAllPages}>
                                Select on all pages
                            </Button>
                        </div>
                    )}
                </div>
            )}
            <ObjectList objects={step.objects} onMove={moveObject} filterMatches={filterMatches} />
        </div>
    );
};

const useStyles = makeStyles({
    filterSection: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalXS,
        paddingBottom: tokens.spacingVerticalS,
        borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
        marginBottom: tokens.spacingVerticalXS,
    },

    filterRow: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        flexWrap: 'wrap',
    },

    filterLabel: {
        ...typographyStyles.caption1Strong,
        color: tokens.colorNeutralForeground2,
        whiteSpace: 'nowrap',
    },

    pillRow: {
        display: 'flex',
        flexFlow: 'row',
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalXS,
    },

    toleranceField: {
        marginTop: tokens.spacingVerticalXXS,
    },

    actionRow: {
        display: 'flex',
        flexFlow: 'row',
        gap: tokens.spacingHorizontalXS,
        flexWrap: 'wrap',
    },
});
