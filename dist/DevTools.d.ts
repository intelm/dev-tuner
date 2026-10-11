import './dev-tuner.css';
export type DevToolsProps = {
    /** Render nothing when false. Pass `import.meta.env.DEV` to keep it out of production. */
    enabled?: boolean;
};
export default function DevTools({ enabled }: DevToolsProps): import("react").JSX.Element | null;
