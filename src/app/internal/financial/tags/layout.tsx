"use client";
import { TagsProvider } from "@/components/providers/tags";

const TagsLayout = ({ children }: { children: React.ReactNode }) => <TagsProvider>{children}</TagsProvider>;

export default TagsLayout;
