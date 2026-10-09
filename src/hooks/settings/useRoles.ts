import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URLS } from "../../utils/urls";
import { useFetchData } from "../useFetchData";
import httpService from "../../config/httpService";
import { useAtomValue } from "jotai";
import { userAtom } from "../../utils/atom/user";
import type { ITeamMember, ITeamMembersResponse } from "../../type/user";
import { toast } from "@heroui/react";

export function getMemberUserId(member: ITeamMember): string {
    // if (typeof member?.user === "object" && member.user?._id) {
    return member?.user?._id ?? "";
    // }
    // if (typeof member?.user === "string" && member.user) {
    //     return member.user;
    // }
    // return (member as any)?.userId || member?._id || "";
}

const useRoles = () => {
    const queryClient = useQueryClient();
    const user = useAtomValue(userAtom);

    const useGetUsersRoles = () => {
        return useFetchData<ITeamMembersResponse>({
            endpoint: URLS.GET_TEAM(user?._id ?? ""),
            name: [URLS.GET_TEAM(user?._id ?? "")],
            enable: user?._id ? true : false
        });
    };

    /** 🔹 Create Team Member */
    const addTeamMember = useMutation({
        mutationFn: (data: FormData) =>
            httpService.post(URLS.ADD_TEAM, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [URLS.GET_TEAM(user?._id ?? "")],
            });
            toast.success("Team member added successfully");
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to add team member";
            toast.danger(msg);
        },
    });

    /** 🔹 Delete Team Member */
    const deleteTeamMember = useMutation({
        mutationFn: async (memberUserId: string) => {
            const url = URLS.DELETE_TEAM_MEMBER(memberUserId);
            try {
                return await httpService.delete(url);
            } catch (err: any) {
                if (err?.response?.status === 405) {
                    return await httpService.post(url);
                }
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [URLS.GET_TEAM(user?._id ?? "")],
            });
            toast.success("Team member removed successfully");
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to remove team member";
            toast.danger(msg);
        },
    });

    /** 🔹 Update Team Member */
    const updateTeamMember = useMutation({
        mutationFn: async ({
            memberUserId,
            data,
        }: {
            memberUserId: string;
            data: Record<string, any> | FormData;
        }) => {
            const url = URLS.UPDATE_TEAM_MEMBER(memberUserId);
            const isFormData =
                typeof FormData !== "undefined" && data instanceof FormData;
            const config = isFormData
                ? { headers: { "Content-Type": "multipart/form-data" } }
                : {};
            try {
                return await httpService.patch(url, data, config);
            } catch (err: any) {
                if (err?.response?.status === 405 || err?.response?.status === 404) {
                    try {
                        return await httpService.put(url, data, config);
                    } catch (putErr: any) {
                        if (
                            putErr?.response?.status === 405 ||
                            putErr?.response?.status === 404
                        ) {
                            return await httpService.post(url, data, config);
                        }
                        throw putErr;
                    }
                }
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [URLS.GET_TEAM(user?._id ?? "")],
            });
            toast.success("Member details updated successfully");
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update member details";
            toast.danger(msg);
        },
    });

    const formik = useFormik({
        initialValues: {
            fullname: "",
            phone: "",
            email: "",
            birthDate: "",
            role: "",
            photo: null as File | null,
        },
        // validationSchema: validationAppointmentSchema,
        onSubmit: (values) => {
            const formData = new FormData();

            formData.append("fullname", values.fullname);
            formData.append("phone", values.phone);
            formData.append("email", values.email);
            formData.append("birthDate", values.birthDate);
            formData.append("role", values.role);
            if (values.photo) {
                formData.append("photo", values.photo);
            }

            addTeamMember.mutate(formData);
        },
    });

    const isLoading = addTeamMember.isPending;

    return {
        useGetUsersRoles,
        addTeamMember,
        deleteTeamMember,
        updateTeamMember,
        formik,
        isLoading,
    };
};

export default useRoles;