import React from 'react';
import { useHistory } from 'react-router-dom';

import { useAppState, useActions } from 'app/overmind';
import { sandboxUrl } from '@codesandbox/common/lib/utils/url-generator';
import track from '@codesandbox/common/lib/utils/analytics';
import { SandboxCard } from './CommunitySandboxCard';
import { SandboxListItem } from './CommunitySandboxListItem';
import { getTemplateIcon } from './TemplateIcon';
import { useSelection } from '../Selection';
import { DashboardCommunitySandbox } from '../../types';

interface GenericSandboxProps {
  isScrolling: boolean;
  item: DashboardCommunitySandbox;
}

export const CommunitySandbox = ({
  isScrolling,
  item,
}: GenericSandboxProps) => {
  const {
    dashboard: { viewMode },
  } = useAppState();
  const {
    dashboard: { likeCommunitySandbox, unlikeSandbox },
  } = useActions();

  const { sandbox } = item;
  const title = sandbox.title || sandbox.alias || sandbox.id;
  const forkCount = sandbox.forkCount;
  const likeCount = sandbox.likeCount;
  const url = sandboxUrl({ id: sandbox.id, alias: sandbox.alias });
  const author = sandbox.author;
  const liked = sandbox.liked;

  const TemplateIcon = getTemplateIcon(sandbox);

  let screenshotUrl = sandbox.screenshotUrl;
  // We set a fallback thumbnail in the API which is used for
  // both old and new dashboard, we can move this logic to the
  // backend when we deprecate the old dashboard
  if (screenshotUrl === 'https://codesandbox.io/static/img/banner.png') {
    screenshotUrl = '/static/img/default-sandbox-thumbnail.png';
  }

  // interactions
  const {
    selectedIds,
    onClick: onSelectionClick,
    onMouseDown,
    onRightClick,
    onMenuEvent,
  } = useSelection();

  const selected = selectedIds.includes(sandbox.id);

  const onClick = event => {
    onSelectionClick(event, sandbox.id);
  };

  const onContextMenu = React.useCallback(
    event => {
      event.preventDefault();
      if (event.type === 'contextmenu') onRightClick(event, sandbox.id);
      else onMenuEvent(event, sandbox.id);
    },
    [onRightClick, onMenuEvent, sandbox.id]
  );

  const history = useHistory();
  const onDoubleClick = event => {
    if (event.ctrlKey || event.metaKey) window.open(url, '_blank');
    else history.push(url);

    track('Dashboard - Community Search sandbox opened');
  };

  const [managedLikeCount, setLikeCount] = React.useState(likeCount);
  const [managedLiked, setLiked] = React.useState(liked);
  const onLikeToggle = () => {
    if (managedLiked) {
      unlikeSandbox(sandbox.id);
      setLiked(false);
      setLikeCount(managedLikeCount - 1);
    } else {
      likeCommunitySandbox(sandbox.id);
      setLiked(true);
      setLikeCount(managedLikeCount + 1);
    }
  };

  const sandboxProps = {
    title,
    TemplateIcon,
    screenshotUrl,
    forkCount,
    author,
    likeCount: managedLikeCount,
    liked: managedLiked,
  };

  const interactionProps = {
    tabIndex: 0, // make div focusable
    style: {
      outline: 'none',
    }, // we handle outline with border
    selected,
    onClick,
    onMouseDown,
    onDoubleClick,
    onContextMenu,
    'data-selection-id': sandbox.id,
    onLikeToggle,
  };

  const Component = viewMode === 'list' ? SandboxListItem : SandboxCard;

  return (
    <div>
      <Component
        {...sandboxProps}
        {...interactionProps}
        isScrolling={isScrolling}
      />
    </div>
  );
};
