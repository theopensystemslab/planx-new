import { createFileRoute, notFound } from '@tanstack/react-router';
import gql from 'graphql-tag';
import { client } from 'lib/graphql';
import { Notifications } from 'pages/FlowEditor/components/Notifications/Notifications';
import { Notification } from 'pages/FlowEditor/components/Notifications/types';
import { useStore } from 'pages/FlowEditor/lib/store';
import React from 'react';

export const Route = createFileRoute('/_authenticated/app/$team/notifications')({
  loader: async ({ params }) => {
    const isAuthorised = useStore.getState().canUserEditTeam(params.team);
        if (!isAuthorised) {
          throw notFound();
        }
    
        // TODO only fetch active (resolved = not null) notifications ??
        const {
          data: { notifications },
        } = await client.query<{ notifications: Notification[] }>({
          query: gql`
            query GetNotificationsForTeam($teamSlug: String!) {
              notifications(
                where: { 
                  team: {slug: { _eq: $teamSlug } } 
                }, 
                order_by: { created_at: desc }
              ) {
                id
                flow {
                  name
                  slug
                }
                team {
                  name
                  slug
                }
                type
                createdAt: created_at
                resolvedAt: resolved_at
              }
            }
          `,
          variables: { teamSlug: params.team },
          fetchPolicy: "no-cache",
        });
    
        return {
          notifications,
        };
  },
  component: NotificationsRoute,
});

function NotificationsRoute() {
  const { notifications } = Route.useLoaderData();
  return <Notifications notifications={notifications} />;
}