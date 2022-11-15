# Adding a new component

Let's add a `SetValue` component

`mkdir src/@planx/components/SetValue`

`model.ts`

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

`Public.tsx`

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

`src/pages/FlowEditor/components/forms/FormModal.tsx`

````jsx
  <option value={TYPES.SetValue}>SetValue</option>
`

src/@planx/components/types.ts
`SetValue = 380,`


src/pages/Preview/Node.tsx
```typescript
import SetValue from "@planx/components/SetValue/Public";

case TYPES.SetValue:
  return <SetValue {...allProps} />;
````

`src/@planx/components/Review/Public/Presentational.tsx`

`[TYPES.SetValue]: undefined,`

`src/@planx/components/ui.tsx`
import PlaylistAdd from "@mui/icons-material/PlaylistAdd";
[TYPES.SetValue]: PlaylistAdd,

`src/pages/FlowEditor/components/Flow/components/Node.tsx`

```typescript
case TYPES.SetValue:
  return <Question {...allProps} text="Set Value" />;
```

`src/pages/FlowEditor/data/types.ts`

```typescript
[TYPES.SetValue]: "set-value",
```

`src/pages/FlowEditor/components/forms/index.ts`

```typescript
import SetValue from "@planx/components/SetValue/Editor";
//...
set: SetValueComponent,
```
