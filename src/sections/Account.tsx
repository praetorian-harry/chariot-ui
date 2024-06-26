import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import MD5 from 'crypto-js/md5';

import { Button } from '@/components/Button';
import { Input } from '@/components/form/Input';
import { Paper } from '@/components/Paper';
import { useModifyAccount } from '@/hooks/useAccounts';
import { useMy } from '@/hooks/useMy';
import { useAuth } from '@/state/auth';

import { CollaboratingWith } from './CollaboratingWith';
import { Users } from './Users';

const Account: React.FC = () => {
  const [displayName, setDisplayName] = useState('');

  const { me, friend } = useAuth();
  const { data, status } = useMy({ resource: 'account' });
  const { mutate: updateAccount } = useModifyAccount('updateSetting');
  const account = useMemo(
    () => data?.find(acc => acc.key.endsWith('#settings#')),
    [data]
  );
  const accountDisplayName = account?.config?.displayName || '';
  const isDirty = status === 'success' && accountDisplayName !== displayName;
  const header = MD5(friend.email || me).toString();

  useEffect(() => {
    if (status === 'success') {
      setDisplayName((account?.config?.displayName as string) || '');
    }
  }, [status, account]);

  const collaborators = useMemo(
    () =>
      data
        ?.filter(
          acc =>
            !acc.key.endsWith('#settings#') && acc?.member === acc?.username
        )
        .map(acc => ({
          email: acc.name,
          displayName: acc?.config?.displayName ?? acc.name,
        })),
    [data]
  );

  return (
    <div className="flex h-max w-full flex-col gap-8">
      <Section title="Organization Details">
        <form
          onSubmit={e => {
            e.preventDefault();
            updateAccount({
              username: 'settings',
              config: { displayName },
            });
          }}
        >
          <Input
            label="Organization Name"
            value={displayName}
            name="displayName"
            isLoading={status === 'pending'}
            onChange={e => setDisplayName(e.target.value)}
          />
          <Button
            style={{
              opacity: isDirty ? '100%' : '0%',
              visibility: isDirty ? 'visible' : 'hidden',
              transition: 'opacity 0.1s',
            }}
            className="mt-2"
            type="submit"
            styleType="primary"
          >
            Save
          </Button>
        </form>
      </Section>

      <Section
        title="Authorized Users"
        description="These individuals are allowed to see the data in your Praetorian
            account."
      >
        <Users />
      </Section>
      {/* Regarding `friend.length === 0`: This is a hack to avoid nested impersonation */}
      {/* It's a temporary solution until a better approach is implemented */}
      {collaborators &&
        collaborators.length > 0 &&
        friend.email.length === 0 && (
          <Section
            title="Collaborating With"
            description="These organizations have invited you to view their account details."
          >
            <CollaboratingWith emails={collaborators} />
          </Section>
        )}
      <Section
        title="Whitelisting Details"
        description="We have different methods of whitelisting our service so we can scan your network without being blocked by your security measures."
      >
        <div>
          <div className="pb-2 text-sm text-default-light">
            Every scan will have a unique header of:
          </div>
          <div className="block rounded-[2px] bg-default-light p-4 font-mono font-medium text-default-light">
            Chariot: {header}
          </div>
        </div>
      </Section>
    </div>
  );
};

interface SectionProps extends PropsWithChildren {
  title: string;
  description?: string;
}

const Section = ({ title, description, children }: SectionProps) => {
  return (
    <Paper className="flex gap-28 p-8">
      <div className="w-[260px] shrink-0">
        <h3 className="mb-1 text-lg font-bold">{title}</h3>
        <p className="text-sm text-default-light">{description}</p>
      </div>
      <div className="h-max w-full">{children}</div>
    </Paper>
  );
};

export default Account;
