import {
    Button,
    Combobox,
    Field,
    Option,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import React, { useMemo, useState } from 'react';
import { useScene } from '../../SceneProvider';
import { SceneObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

/** Collect all distinct non-empty trackIds used across all steps in the scene. */
function useAllTrackIds(currentObjectIds: readonly number[]): string[] {
    const { scene } = useScene();
    return useMemo(() => {
        const seen = new Set<string>();
        for (const step of scene.steps) {
            for (const obj of step.objects) {
                if (obj.trackId && !currentObjectIds.includes(obj.id)) {
                    seen.add(obj.trackId);
                }
            }
        }
        return Array.from(seen).sort();
    }, [scene.steps, currentObjectIds]);
}

export const TrackIdControl: React.FC<PropertiesControlProps<SceneObject>> = ({ objects, className }) => {
    const classes = useStyles();
    const { dispatch } = useScene();
    const [inputValue, setInputValue] = useState<string | undefined>(undefined);

    const objectIds = useMemo(() => objects.map((o) => o.id), [objects]);
    const allTrackIds = useAllTrackIds(objectIds);

    const trackId = commonValue(objects, (obj) => obj.trackId ?? '');
    // Controlled display value: prefer the live input while typing, fall back to stored value
    const displayValue = inputValue ?? trackId ?? '';

    const commit = (value: string) => {
        setInputValue(undefined);
        const newId = value.trim() || undefined;
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, trackId: newId })) });
    };

    const clear = () => {
        setInputValue(undefined);
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, trackId: undefined })) });
    };

    // Filter suggestions by current input
    const filtered = useMemo(
        () => allTrackIds.filter((id) => id.toLowerCase().includes(displayValue.toLowerCase())),
        [allTrackIds, displayValue],
    );

    return (
        <Field label="Track ID" className={className}>
            <div className={classes.row}>
                <Combobox
                    className={classes.combobox}
                    value={displayValue}
                    selectedOptions={trackId ? [trackId] : []}
                    freeform
                    size="small"
                    placeholder="e.g. T1, healer_1"
                    onChange={(ev) => setInputValue(ev.target.value)}
                    onOptionSelect={(_, data) => {
                        commit(data.optionValue ?? '');
                    }}
                    onBlur={(ev) => {
                        commit(ev.target.value);
                    }}
                >
                    {filtered.map((id) => (
                        <Option key={id} value={id}>{id}</Option>
                    ))}
                </Combobox>
                {displayValue && (
                    <Button
                        className={classes.clearBtn}
                        appearance="subtle"
                        size="small"
                        icon={<DismissRegular />}
                        aria-label="Clear track ID"
                        onClick={clear}
                    />
                )}
            </div>
        </Field>
    );
};

const useStyles = makeStyles({
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '4px',
    },
    combobox: {
        flex: '1 1 auto',
        minWidth: 0,
    },
    clearBtn: {
        flexShrink: 0,
        color: tokens.colorNeutralForeground3,
        ':hover': {
            color: tokens.colorNeutralForeground1,
        },
    },
});
