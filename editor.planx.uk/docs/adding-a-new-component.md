# Adding a new @planx component

Let's add a `SetValue` component

## Core directory & files 

1. `src/@planx/components/types.ts`

```typescript
SetValue = 380,
```

1. `mkdir src/@planx/components/SetValue`

1. `model.ts`

```typescript
import { MoreInformation, parseMoreInformation } from "../shared";

export interface SetValue extends MoreInformation {
  fn: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): SetValue => ({
  fn: data?.fn || "",
  ...parseMoreInformation(data),
});
```

1. `Editor.tsx`

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

1. `Public.tsx`

```typescript
import { PublicProps } from "@planx/components/ui";

type Props = PublicProps<SetValue>;

function SetValueComponent(props: Props) {
  return (
    <Card handleSubmit={props.handleSubmit} isValid>
      <QuestionHeader
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
    </Card>
  );
}
```

1. `Public.test.tsx`

```typescript
// SetValue doesn't have a /preview representation, but for
//   component types that do, add at least an axe accessibility test in here
```

## Editor configurations

1. `src/pages/FlowEditor/components/forms/FormModal.tsx`

```jsx
  <option value={TYPES.SetValue}>SetValue</option>
```

1. `src/@planx/components/ui.tsx`

```typescript 
import PlaylistAdd from "@mui/icons-material/PlaylistAdd";
[TYPES.SetValue]: PlaylistAdd,
```

1. `src/pages/FlowEditor/components/Flow/components/Node.tsx`

```typescript
case TYPES.SetValue:
  return <Question {...allProps} text="Set Value" />;
```

1. `src/pages/FlowEditor/data/types.ts`

```typescript
[TYPES.SetValue]: "set-value",
```

1. `src/pages/FlowEditor/components/forms/index.ts`

```typescript
import SetValue from "@planx/components/SetValue/Editor";
//...
set: SetValueComponent,
```

## Preview environment & integrations

1. `src/pages/Preview/Node.tsx`

If/how should this component appear to applicants? (eg wrapped in a Card)

```typescript
import SetValue from "@planx/components/SetValue/Public";

case TYPES.SetValue:
  return <SetValue {...allProps} />;
```

1. `src/@planx/components/shared/Preview/SummaryList`

If/how should this component appear on the Review page?

```typescript
[TYPES.SetValue]: undefined,
```

1. `src/@planx/components/Send/bops/index`

If/how should this component be formatted in Send data formats such as BOPS?

```typescript
function isTypeForBopsPayload(type?: TYPES) {
  switch (type) {
    // ... 
    case TYPES.SetValue:
      return false;
    // ...
  }
}
```
