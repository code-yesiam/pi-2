'use client'
import axios from "axios";
import { data } from "autoprefixer";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import {BsGithub, BsGoogle} from 'react-icons/bs'
import {toast} from 'react-hot-toast'
import {signIn, useSession} from 'next-auth/react'
import {useRouter} from 'next/navigation'

import Input from "@/app/components/Input/Input";
import Button from "@/app/components/Button/Button";
import AuthSocialButton from "@/app/(site)/components/AuthSocialButton/AuthSocialButton";

type variant = 'Login' | 'Register'

const AuthForm = () => {
    const router = useRouter()
    const session = useSession()
    //UseState to change variant using variant props and starting with Login
    const [variant, setVariant] = useState<variant>("Login")
    //Loading
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (session?.status === 'authenticated') {
            router.push('/users')
        }
    }, [session?.status, router])

    //Changes to Login/Register based in the option selected (if it's login, it'll be able to change to Register)
    const toggleVariant = useCallback(() => {
        if (variant === 'Login') {
            setVariant('Register')
        } else {
            setVariant('Login')
        }
    }, [variant])

    const {
        //This will be probably the input to register
        register,
        //This will be the Submit if all data will be correct
        handleSubmit,
        //This will be the error message if there's something missed
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        //Possible values in the form
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true)

        if (variant === 'Register') {
            axios.post('/api/register', data)
            .then(() => signIn('credentials', data))
            .catch(() => toast.error('Something went wrong!'))
            .finally(() => setIsLoading(false))
        } if (variant === 'Login') {
            signIn('credentials', {
                ...data,
                redirect: false
            })
            .then((callback) => {
                if (callback?.error) {
                    toast.error('Invalid credentials')
                }

                if (callback?.ok && !callback?.error) {
                    toast.success('Logged in!')
                    router.push('/users')
                }
            })
            .finally(() => setIsLoading(false))
        }

    }

    const socialAction = (action: string) => {
        setIsLoading(true)

        signIn(action, {redirect: false})
        .then((callback) => {
            if (callback?.error) {
                toast.error('Invalid Credentials')
            }

            if (callback?.ok && !callback?.error) {
                toast.success('Logged In!')
            }
        })
        .finally(() => setIsLoading(false))
    }
    return (
        <div
            className="
                mt-8
                sm:mx-auto
                sm:w-full
                sm:max-w-md
            "
        >
            <div
                className="
                    bg-white
                    px-4
                    py-8
                    shadow
                    sm:rounded-lg
                    sm:px-10
                "
            >
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {variant === 'Register' && (
                        <Input 
                            id="name" 
                            label="Name:" 
                            register={register}
                            errors={errors}
                            disabled={isLoading}
                        />
                    )}
                    <Input 
                        id="email" 
                        label="Email:" 
                        register={register}
                        errors={errors}
                        disabled={isLoading}
                    />
                    <Input 
                        id="password" 
                        label="Password:"
                        type="password" 
                        register={register}
                        errors={errors}
                        disabled={isLoading}
                    />
                    <div>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            type="submit"
                        >
                            {variant === 'Login' ? 'Sign in' : 'Register'}
                        </Button>
                    </div>
                </form>
                <div className="mt-6">
                    <div className="relative">
                        <div
                            className="
                                absolute
                                inset-0
                                flex
                                item-center
                            "
                        >
                            <div
                                className="w-full border-t border-gray-300"
                            />

                            
                        </div>
                        <div
                        className="relative flex justify-center text-sm"
                        >
                            <span className="bg-white px-2 text-gray-500">
                                Or continue with:
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <AuthSocialButton
                            icon={BsGithub}
                            onClick={() => socialAction('github')}
                        />
                        <AuthSocialButton
                            icon={BsGoogle}
                            onClick={() => socialAction('google')}
                        />
                    </div>
                </div>
                    <div className="
                        flex
                        gap-2
                        justify-center
                        text-sm
                        mt-6
                        px-2
                        text-gray-500
                    ">
                        <div>
                            {variant === 'Login' ? 'New to Message App?' : 'Already have an account?'}
                        </div>
                        <div
                            onClick={toggleVariant}
                            className="underline cursor-pointer"
                        >
                            {variant === 'Login' ? 'Create an account' : 'Login'}
                        </div>

                    </div>
            </div>
        </div>
    )
}

export default AuthForm