"use client";

import {
    BackButton,
    Button,
    Card,
    CardFooter,
    Code,
    Heading,
} from "@/components/ui";
import { RxReload } from "react-icons/rx";
import {routes} from "@/constants";

const GeneralErrorPage = ({
                              error,
                              reset,
                          }: {
    error: Error;
    reset: () => void;
}) => {
    return (
        <Card>
            <BackButton href={routes.home}>Back to sets</BackButton>
            <Heading>An error occurred</Heading>
            <Code footer={error.stack}>{error.message}</Code>
            <CardFooter className="flex flex-row justify-end">
                <Button variant="secondary" icon={<RxReload />} onClick={reset}>
                    Try again
                </Button>
            </CardFooter>
        </Card>
    );
};

export default GeneralErrorPage;
