UPDATE public.analytics_logs
SET metadata = jsonb_set(
    metadata,
    '{back,type}',
    CASE 
        WHEN metadata->'back'->>'type' = '1' THEN '"Flow"'
        WHEN metadata->'back'->>'type' = '3' THEN '"Result"'
        WHEN metadata->'back'->>'type' = '7' THEN '"TaskList"'
        WHEN metadata->'back'->>'type' = '8' THEN '"Notice"'
        WHEN metadata->'back'->>'type' = '9' THEN '"FindProperty"'
        WHEN metadata->'back'->>'type' = '10' THEN '"DrawBoundary"'
        WHEN metadata->'back'->>'type' = '11' THEN '"PlanningConstraints"'
        WHEN metadata->'back'->>'type' = '12' THEN '"PropertyInformation"'
        WHEN metadata->'back'->>'type' = '100' THEN '"Statement"'
        WHEN metadata->'back'->>'type' = '105' THEN '"Checklist"'
        WHEN metadata->'back'->>'type' = '110' THEN '"TextInput"'
        WHEN metadata->'back'->>'type' = '120' THEN '"DateInput"'
        WHEN metadata->'back'->>'type' = '130' THEN '"AddressInput"'
        WHEN metadata->'back'->>'type' = '135' THEN '"ContactInput"'
        WHEN metadata->'back'->>'type' = '140' THEN '"FileUpload"'
        WHEN metadata->'back'->>'type' = '145' THEN '"FileUploadAndLabel"'
        WHEN metadata->'back'->>'type' = '150' THEN '"NumberInput"'
        WHEN metadata->'back'->>'type' = '200' THEN '"Response"'
        WHEN metadata->'back'->>'type' = '250' THEN '"Content"'
        WHEN metadata->'back'->>'type' = '300' THEN '"InternalPortal"'
        WHEN metadata->'back'->>'type' = '310' THEN '"ExternalPortal"'
        WHEN metadata->'back'->>'type' = '360' THEN '"Section"'
        WHEN metadata->'back'->>'type' = '380' THEN '"SetValue"'
        WHEN metadata->'back'->>'type' = '400' THEN '"Pay"'
        WHEN metadata->'back'->>'type' = '500' THEN '"Filter"'
        WHEN metadata->'back'->>'type' = '600' THEN '"Review"'
        WHEN metadata->'back'->>'type' = '650' THEN '"Send"'
        WHEN metadata->'back'->>'type' = '700' THEN '"Calculate"'
        WHEN metadata->'back'->>'type' = '725' THEN '"Confirmation"'
        WHEN metadata->'back'->>'type' = '730' THEN '"NextSteps"'
        ELSE metadata->'back'->>'type'
    END::jsonb
)
WHERE metadata->'back'->>'type' IN ('1', '3', '7', '8', '9', '10', '11', '12', '100', '105', '110', '120', '130', '135', '140', '145', '150', '200', '250', '300', '310', '360', '380', '400', '500', '600', '650', '700', '725', '730');


UPDATE public.analytics_logs
SET metadata = jsonb_set(
    metadata,
    '{change,type}',
    CASE 
        WHEN metadata->'change'->>'type' = '1' THEN '"Flow"'
        WHEN metadata->'change'->>'type' = '3' THEN '"Result"'
        WHEN metadata->'change'->>'type' = '7' THEN '"TaskList"'
        WHEN metadata->'change'->>'type' = '8' THEN '"Notice"'
        WHEN metadata->'change'->>'type' = '9' THEN '"FindProperty"'
        WHEN metadata->'change'->>'type' = '10' THEN '"DrawBoundary"'
        WHEN metadata->'change'->>'type' = '11' THEN '"PlanningConstraints"'
        WHEN metadata->'change'->>'type' = '12' THEN '"PropertyInformation"'
        WHEN metadata->'change'->>'type' = '100' THEN '"Statement"'
        WHEN metadata->'change'->>'type' = '105' THEN '"Checklist"'
        WHEN metadata->'change'->>'type' = '110' THEN '"TextInput"'
        WHEN metadata->'change'->>'type' = '120' THEN '"DateInput"'
        WHEN metadata->'change'->>'type' = '130' THEN '"AddressInput"'
        WHEN metadata->'change'->>'type' = '135' THEN '"ContactInput"'
        WHEN metadata->'change'->>'type' = '140' THEN '"FileUpload"'
        WHEN metadata->'change'->>'type' = '145' THEN '"FileUploadAndLabel"'
        WHEN metadata->'change'->>'type' = '150' THEN '"NumberInput"'
        WHEN metadata->'change'->>'type' = '200' THEN '"Response"'
        WHEN metadata->'change'->>'type' = '250' THEN '"Content"'
        WHEN metadata->'change'->>'type' = '300' THEN '"InternalPortal"'
        WHEN metadata->'change'->>'type' = '310' THEN '"ExternalPortal"'
        WHEN metadata->'change'->>'type' = '360' THEN '"Section"'
        WHEN metadata->'change'->>'type' = '380' THEN '"SetValue"'
        WHEN metadata->'change'->>'type' = '400' THEN '"Pay"'
        WHEN metadata->'change'->>'type' = '500' THEN '"Filter"'
        WHEN metadata->'change'->>'type' = '600' THEN '"Review"'
        WHEN metadata->'change'->>'type' = '650' THEN '"Send"'
        WHEN metadata->'change'->>'type' = '700' THEN '"Calculate"'
        WHEN metadata->'change'->>'type' = '725' THEN '"Confirmation"'
        WHEN metadata->'change'->>'type' = '730' THEN '"NextSteps"'
        ELSE metadata->'change'->>'type'
    END::jsonb
)
WHERE metadata->'change'->>'type' IN ('1', '3', '7', '8', '9', '10', '11', '12', '100', '105', '110', '120', '130', '135', '140', '145', '150', '200', '250', '300', '310', '360', '380', '400', '500', '600', '650', '700', '725', '730');
