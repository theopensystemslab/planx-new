# Adding a new @planx component

Let's add a `SetValue` component

## Core directory typing

1. `planx-core/src/types/component.ts`

Add type to enum in `planx-core` repository

```typescript
SetValue = 380,
```

## `planx-new` component files

1. `mkdir src/@planx/components/SetValue`

2. `model.ts`

```typescript
import { BaseNodeData, parseBaseNodeData } from "../shared";

export interface SetValue extends BaseNodeData {
  fn: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): SetValue => ({
  fn: data?.fn || "",
  ...parseBaseNodeData(data),
});
```

3. `Editor.tsx`

```typescript
type Props = EditorProps<TYPES.SetValue, SetValue>;

export default SetValueComponent;

function SetValueComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseSetValue(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.SetValue,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      //...
    </form>
  );
}
```

5. `Public.tsx`

```typescript
import { PublicProps } from "@planx/components/shared/types";

type Props = PublicProps<SetValue>;

function SetValueComponent(props: Props) {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <CardHeader
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
    </Card>
  );
}
```

6. `Public.test.tsx`

```typescript
// SetValue doesn't have a /preview representation, but for
//   component types that do, add at least an axe accessibility test in here
```

## Editor configurations

1. `src/@planx/components/shared/icons.tsx`

```typescript
import PlaylistAdd from "@mui/icons-material/PlaylistAdd";
[TYPES.SetValue]: PlaylistAdd,
```

2. `src/pages/FlowEditor/data/types.ts`

```typescript
[TYPES.SetValue]: "set-value",
```

3. `src/pages/FlowEditor/components/Flow/components/Node.tsx`

```typescript
case TYPES.SetValue:
  return <Question {...allProps} text="Set Value" />;
```

4. `src/pages/FlowEditor/components/forms/FormModal.tsx`

```jsx
<option value={TYPES.SetValue}>SetValue</option>
```

5. `src/pages/FlowEditor/components/forms/index.ts`

```typescript
import SetValue from "@planx/components/SetValue/Editor";
//...
set: SetValueComponent,
```

## Preview environment & integrations

1. `src/pages/Preview/Node.tsx`

If/how should this component appear to applicants?

```typescript
import SetValue from "@planx/components/SetValue/Public";

case TYPES.SetValue:
  return <SetValue {...allProps} />;
```

2. `src/@planx/components/shared/Preview/SummaryList`

If/how should this component appear in a Review component:

```typescript
[TYPES.SetValue]: undefined,
```

