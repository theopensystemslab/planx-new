UPDATE flows
SET status = 'offline',
    is_service = FALSE
WHERE flows.id IN (
    'fcf3770c-6fdf-416f-be90-60522beb7d88',
    '1a679d42-ab7a-43dc-9f57-607e394c1ae7',
    'f66cb065-b64c-4197-9952-7aba402e3d1c',
    'd32655e0-a08b-4b70-8bc5-735d0b9ed7ce',
    'e299957d-cabf-44ee-956b-690b4c97b4e5',
    '0db9a6cb-9509-4462-967a-21e61d9635c9',
    'd4a595b0-0860-4d9a-a4f8-12c87bd15a50',
    'ea5a15e5-b4cc-4278-8610-7db32a6aee9a',
    'fc73c71a-07c1-46fc-add2-e8c4fd894a0b',
    '47fac3dd-ea31-4a06-b94c-e63d4603e9f3',
    'b90ef7d9-e3b7-4357-be42-56a5c2d19eed',
    'd97a7bf0-803b-404e-80ca-503699f8a5f7',
    '3c31aa39-5631-4be4-8539-1a0785e1490a',
    '155092b1-d323-4efc-bbb5-2b2afa507d7a',
    '6a235f0e-0fe2-475e-a8cf-af97e753d0d2',
    'b7a6b5a1-692f-4ff2-85cc-085ea9af9e56',
    'e5d93936-fac9-4a4b-9d14-12bd0b57c236',
    'a9fb3f14-8dd3-46ff-9e21-1abe6cb162cd',
    '44c2e760-fbd4-49c2-8395-15aab752211d',
    'e1d3e946-f0b8-44f9-884a-856c356f1f96',
    '350d8391-3cff-4f8f-910c-40400c257303',
    'f8c06236-1fa9-4153-878a-6ac9fd6ef18c',
    '6dbc6dc1-0cbd-49f5-8099-1bd4571c968c',
    'e739129b-42ef-409f-a560-30b8de0d0caa',
    '5df53177-bd18-4bcb-83dd-73223c446acb',
    '413e186b-ab77-498b-a71d-a9a3ab51ac89',
    '07ce6134-18af-4b16-8c8d-5e28bcf0cae4',
    '3f188f2a-8d51-4b1e-8eeb-fa6ca9531848',
    'd1443946-b7b9-4cd2-b3c7-bfba6f709deb',
    'dbb86ced-a348-499b-b5bf-ef3b56e3ee35',
    '2efd2904-e79b-4525-87f9-011ecb463f34',
    'a487411b-2404-4f1a-9724-90d6d06398f6',
    'f63915e8-538e-4840-b0b3-17bd03d4a90e',
    '0fb37e08-3bd2-4bd7-95a9-7c4c0546989e'
)
OR (
    flows.team_id IN (1, 5)
    AND is_template = FALSE
);
