import PropTypes from 'prop-types';
// Router
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Drawer, Typography, Avatar, Divider } from '@mui/material';
// mock
import account from '_mock/account';
// hooks
import useResponsive from 'hooks/useResponsive';
// components
import Logo from 'components/logo';
import Scrollbar from 'components/scrollbar';
// Navigate Section
import { useAuth } from 'store/index';
import { NavSection } from './config';
// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));
const StyledLogo = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2, 2.5),
  width: '100%',
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const isDesktop = useResponsive('up', 'lg');
  const userCred = useAuth((state) => state.userCredentials);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ display: 'inline-flex' }}>
        <StyledLogo>
          <Logo />
        </StyledLogo>
      </Box>
      <Divider variant="middle" sx={{ mb: 3 }} />
      <Box sx={{ mb: 5, mx: 2.5 }}>
        <Link underline="none">
          <StyledAccount>
            <Avatar src={account.photoURL} alt="photoURL" />
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {userCred.email.split('@', 1)[0].charAt(0).toUpperCase() + userCred.email.split('@', 1)[0].slice(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {account.role}
              </Typography>
            </Box>
          </StyledAccount>
        </Link>
        <NavSection onCloseNav={onCloseNav} />
      </Box>
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        // width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
