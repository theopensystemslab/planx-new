UPDATE public.analytics_logs
SET metadata = jsonb_set(
    metadata,
    '{back,type}',
    CASE 
        WHEN metadata->'back'->>'type' = 'Flow' THEN '1'
        WHEN metadata->'back'->>'type' = 'Result' THEN '3'
        WHEN metadata->'back'->>'type' = 'TaskList' THEN '7'
        WHEN metadata->'back'->>'type' = 'Notice' THEN '8'
        WHEN metadata->'back'->>'type' = 'FindProperty' THEN '9'
        WHEN metadata->'back'->>'type' = 'DrawBoundary' THEN '10'
        WHEN metadata->'back'->>'type' = 'PlanningConstraints' THEN '11'
        WHEN metadata->'back'->>'type' = 'PropertyInformation' THEN '12'
        WHEN metadata->'back'->>'type' = 'Statement' THEN '100'
        WHEN metadata->'back'->>'type' = 'Checklist' THEN '105'
        WHEN metadata->'back'->>'type' = 'TextInput' THEN '110'
        WHEN metadata->'back'->>'type' = 'DateInput' THEN '120'
        WHEN metadata->'back'->>'type' = 'AddressInput' THEN '130'
        WHEN metadata->'back'->>'type' = 'ContactInput' THEN '135'
        WHEN metadata->'back'->>'type' = 'FileUpload' THEN '140'
        WHEN metadata->'back'->>'type' = 'FileUploadAndLabel' THEN '145'
        WHEN metadata->'back'->>'type' = 'NumberInput' THEN '150'
        WHEN metadata->'back'->>'type' = 'Response' THEN '200'
        WHEN metadata->'back'->>'type' = 'Content' THEN '250'
        WHEN metadata->'back'->>'type' = 'InternalPortal' THEN '300'
        WHEN metadata->'back'->>'type' = 'ExternalPortal' THEN '310'
        WHEN metadata->'back'->>'type' = 'Section' THEN '360'
        WHEN metadata->'back'->>'type' = 'SetValue' THEN '380'
        WHEN metadata->'back'->>'type' = 'Pay' THEN '400'
        WHEN metadata->'back'->>'type' = 'Filter' THEN '500'
        WHEN metadata->'back'->>'type' = 'Review' THEN '600'
        WHEN metadata->'back'->>'type' = 'Send' THEN '650'
        WHEN metadata->'back'->>'type' = 'Calculate' THEN '700'
        WHEN metadata->'back'->>'type' = 'Confirmation' THEN '725'
        WHEN metadata->'back'->>'type' = 'NextSteps' THEN '730'
        ELSE metadata->'back'->>'type'
    END::jsonb
)
WHERE metadata->'back'->>'type' IN ('Flow', 'Result', 'TaskList', 'Notice', 'FindProperty', 'DrawBoundary', 'PlanningConstraints', 'PropertyInformation', 'Statement', 'Checklist', 'TextInput', 'DateInput', 'AddressInput', 'ContactInput', 'FileUpload', 'FileUploadAndLabel', 'NumberInput', 'Response', 'Content', 'InternalPortal', 'ExternalPortal', 'Section', 'SetValue', 'Pay', 'Filter', 'Review', 'Send', 'Calculate', 'Confirmation', 'NextSteps');


UPDATE public.analytics_logs
SET metadata = jsonb_set(
    metadata,
    '{change,type}',
    CASE 
        WHEN metadata->'change'->>'type' = 'Flow' THEN '1'
        WHEN metadata->'change'->>'type' = 'Result' THEN '3'
        WHEN metadata->'change'->>'type' = 'TaskList' THEN '7'
        WHEN metadata->'change'->>'type' = 'Notice' THEN '8'
        WHEN metadata->'change'->>'type' = 'FindProperty' THEN '9'
        WHEN metadata->'change'->>'type' = 'DrawBoundary' THEN '10'
        WHEN metadata->'change'->>'type' = 'PlanningConstraints' THEN '11'
        WHEN metadata->'change'->>'type' = 'PropertyInformation' THEN '12'
        WHEN metadata->'change'->>'type' = 'Statement' THEN '100'
        WHEN metadata->'change'->>'type' = 'Checklist' THEN '105'
        WHEN metadata->'change'->>'type' = 'TextInput' THEN '110'
        WHEN metadata->'change'->>'type' = 'DateInput' THEN '120'
        WHEN metadata->'change'->>'type' = 'AddressInput' THEN '130'
        WHEN metadata->'change'->>'type' = 'ContactInput' THEN '135'
        WHEN metadata->'change'->>'type' = 'FileUpload' THEN '140'
        WHEN metadata->'change'->>'type' = 'FileUploadAndLabel' THEN '145'
        WHEN metadata->'change'->>'type' = 'NumberInput' THEN '150'
        WHEN metadata->'change'->>'type' = 'Response' THEN '200'
        WHEN metadata->'change'->>'type' = 'Content' THEN '250'
        WHEN metadata->'change'->>'type' = 'InternalPortal' THEN '300'
        WHEN metadata->'change'->>'type' = 'ExternalPortal' THEN '310'
        WHEN metadata->'change'->>'type' = 'Section' THEN '360'
        WHEN metadata->'change'->>'type' = 'SetValue' THEN '380'
        WHEN metadata->'change'->>'type' = 'Pay' THEN '400'
        WHEN metadata->'change'->>'type' = 'Filter' THEN '500'
        WHEN metadata->'change'->>'type' = 'Review' THEN '600'
        WHEN metadata->'change'->>'type' = 'Send' THEN '650'
        WHEN metadata->'change'->>'type' = 'Calculate' THEN '700'
        WHEN metadata->'change'->>'type' = 'Confirmation' THEN '725'
        WHEN metadata->'change'->>'type' = 'NextSteps' THEN '730'
        ELSE metadata->'change'->>'type'
    END::jsonb
)
WHERE metadata->'change'->>'type' IN ('Flow', 'Result', 'TaskList', 'Notice', 'FindProperty', 'DrawBoundary', 'PlanningConstraints', 'PropertyInformation', 'Statement', 'Checklist', 'TextInput', 'DateInput', 'AddressInput', 'ContactInput', 'FileUpload', 'FileUploadAndLabel', 'NumberInput', 'Response', 'Content', 'InternalPortal', 'ExternalPortal', 'Section', 'SetValue', 'Pay', 'Filter', 'Review', 'Send', 'Calculate', 'Confirmation', 'NextSteps');