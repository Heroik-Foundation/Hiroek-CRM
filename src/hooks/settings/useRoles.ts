import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query"; 
import { URLS } from "../../utils/urls";
import { useFetchData } from "../useFetchData";
import httpService from "../../config/httpService";
import { useAtomValue } from "jotai";
import { userAtom } from "../../utils/atom/user";
import type { ITeamMembersResponse } from "../../type/user";
// import { handleError } from "../../utils/handleError";

const useRoles = () => {

    const user = useAtomValue(userAtom)
    
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
        // onError: handleError,
        onSuccess: (data) => {
            console.log(data);
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

            console.log(values);
            
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
        formik,
        isLoading,
    };
};

export default useRoles;