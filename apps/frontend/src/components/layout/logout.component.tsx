import { isGeneral } from '@kursor/react/helpers/is.general';
import { useCallback } from 'react';
import { deleteDialog } from '@kursor/react/helpers/delete.dialog';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';

export const LogoutComponent = () => {
  const fetch = useFetch();
  const logout = useCallback(async () => {
    if (await deleteDialog('Are you sure you want to logout?', 'Yes logout')) {
      await fetch('/user/logout', {
        method: 'POST',
      });

      window.location.href = '/';
    }
  }, []);

  return <div className="text-red-400 cursor-pointer" onClick={logout}>Logout from Kursor</div>;
};
