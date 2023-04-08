import Header from "@components/Header";
import { Auth } from "@supabase/auth-ui-react";
import {
  Button,
  Stack,
  Box,
  Popover,
  PopoverTrigger,
  Link,
  Flex,
  IconButton,
  useColorModeValue,
  HStack,
  Menu,
  MenuButton,
  Avatar,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

import { HamburgerIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import {
  useSession,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { ReactNode, useEffect } from "react";
import Home from "../components/Home";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import * as React from "react";
import useToggle from "hooks/useToggle";

const Layout = ({
  children,
  onSignIn,
}: {
  children: ReactNode;
  onSignIn: () => void;
}) => {
  const supabase = useSupabaseClient();

  const user = useUser();
  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <HStack spacing={8} alignItems={"center"}>
            <Box>GPT Assistant</Box>
          </HStack>
          <Flex alignItems={"center"}>
            {user ? (
              <Button
                variant={"solid"}
                colorScheme={"teal"}
                size={"sm"}
                mr={4}
                onClick={() => supabase.auth.signOut()}
              >
                Sign out
              </Button>
            ) : (
              <Button
                variant={"solid"}
                colorScheme={"teal"}
                size={"sm"}
                mr={4}
                onClick={onSignIn}
              >
                Sign in
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>
      <Box p={4}>{children}</Box>
    </>
  );
};

function Homepage() {
  const session = useSession();
  const supabase = useSupabaseClient();

  const user = useUser();

  const authToggle = useToggle();

  useEffect(() => {
    (async () => {
      console.log("supabase.auth: ", await supabase.auth.getUser());
    })();
  });

  supabase.auth.onAuthStateChange((event) => {
    console.log(event);
  });

  useEffect(() => {
    if (user) {
      authToggle.setOff;
    }
  }, [user, authToggle.setOff]);

  return (
    <Layout onSignIn={authToggle.setOn}>
      <Modal isOpen={authToggle.on} onClose={authToggle.setOff}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign in</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Auth
              // redirectTo="http://localhost:3000/"
              // appearance={{
              //   theme: ThemeSupa,
              //   variables: {
              //     default: {
              //       colors: {
              //         brand: "red", // TODO replace with chakra primary
              //         // brandAccent: "green",
              //       },
              //     },
              //   },
              // }}
              supabaseClient={supabase}
              onAuthEvent={(event) => {
                if (event === "sign_in") {
                  foo();
                } else if (event === "sign_up") {
                  bar();
                }
              }}

              // providers={["google", "github"]}
              // socialLayout="horizontal"
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Home />
    </Layout>
  );
}

export default Homepage;
